//+------------------------------------------------------------------+
//| EA_FTMO_ICT_NAS100.mq5                                           |
//| Robot inspire de la methode ICT/SMC multi-timeframe (HTF/MTF/LTF)|
//| decrite par l'utilisateur, adapte a NAS100 pour un compte FTMO.  |
//|                                                                    |
//| INTERPRETATION : la methode d'origine ne precise ni le stop-loss,|
//| ni le take-profit, ni la definition exacte d'un "point" de       |
//| structure, ni la temporalite HTF exacte. Tous les choix faits    |
//| pour combler ces trous sont documentes dans README.md, section   |
//| "Choix d'interpretation". Ce n'est PAS "la" methode ICT officielle|
//| mais une traduction en regles mecaniques, faite pour etre testee.|
//+------------------------------------------------------------------+
#property copyright "SOS Shine"
#property version   "1.00"
#property strict

#include <Trade\Trade.mqh>

//--- Temporalites (voir README pour la justification de ces choix)
input ENUM_TIMEFRAMES InpHTF          = PERIOD_H4;   // biais de tendance (via Fair Value Gap)
input ENUM_TIMEFRAMES InpStructureTF  = PERIOD_M15;  // structure de marche / key levels
input ENUM_TIMEFRAMES InpConfirmTF    = PERIOD_M5;   // invalidation de biais (change of character)
input ENUM_TIMEFRAMES InpEntryTF      = PERIOD_M1;   // prise de liquidite + entree

//--- Structure de marche
input int    InpSwingLookback       = 2;    // bougies de chaque cote pour valider un point de structure
input int    InpFVGLookbackBars     = 40;   // profondeur de recherche du dernier FVG HTF non mitige
input int    InpMaxSweepSearchBars  = 5;    // bougies M1 apres une prise de liquidite pour attendre l'inverse FVG
input double InpKeyLevelTolerancePts= 50;   // tolerance (en points) pour considerer qu'on a atteint le key level

//--- Risque / stops
input int    InpAtrPeriod           = 14;   // ATR calcule sur InpEntryTF
input double InpStopBufferAtrMult   = 0.3;  // marge de securite sous/sur le point balaye
input double InpRiskRewardRatio     = 2.0;  // cible = ce ratio x le risque pris
input double InpRiskPerTradePct     = 0.4;  // % du solde risque par trade

//--- Coupe-circuits (identiques dans l'esprit a l'EA EURUSD)
input double InpDailyLossLimitPct   = 2.0;
input double InpMaxDrawdownPct      = 6.0;

//--- Session et fermeture (NAS100 n'est pas un marche 24h/24, contrairement au forex)
input bool   InpUseSessionFilter    = true;
input int    InpSessionStartHour    = 14;   // heure SERVEUR : a ajuster pour cibler la NY AM killzone (~9h30-11h NY)
input int    InpSessionEndHour      = 17;   // heure SERVEUR
input bool   InpCloseBeforeDailyClose = true;
input int    InpDailyCloseHour      = 21;   // heure SERVEUR : ferme tout avant la cloture pour eviter le risque de gap

//--- Divers
input ulong  InpMagicNumber    = 990022;
input bool   InpResetHaltState = false;

#define MAX_SCAN_BARS 300

CTrade trade;
int atrHandle = INVALID_HANDLE;

datetime lastHtfBarTime = 0;
datetime lastStructBarTime = 0;
datetime lastConfirmBarTime = 0;
datetime lastEntryBarTime = 0;
datetime lastDayStart = 0;

double dayStartBalance = 0.0;
double initialBalance  = 0.0;
bool   tradingHalted   = false;

int    htfBias = 0;          // 1 = haussier, -1 = baissier, 0 = aucun biais clair
double keyLevelHigh = 0.0;   // dernier "key level" haut (structure MTF)
double keyLevelLow  = 0.0;   // dernier "key level" bas (structure MTF)
double confirmSwingHigh = 0.0; // dernier swing haut sur InpConfirmTF (pour detecter un CHoCH)
double confirmSwingLow  = 0.0;

bool   awaitingInverseFVG = false;
int    awaitingDirection  = 0; // 1 = on attend un FVG haussier (apres balayage vendeur), -1 = inverse
double sweepExtreme       = 0.0;
int    barsSinceSweep     = 0;

string GVPrefix()   { return "FTMO_ICT_" + _Symbol + "_" + IntegerToString(InpMagicNumber) + "_"; }
string GVInitBal()  { return GVPrefix() + "InitialBalance"; }
string GVDayStart() { return GVPrefix() + "DayStart"; }
string GVDayBal()   { return GVPrefix() + "DayStartBalance"; }
string GVHalted()   { return GVPrefix() + "Halted"; }

//+------------------------------------------------------------------+
double H(ENUM_TIMEFRAMES tf, int shift) { return iHigh(_Symbol, tf, shift); }
double L(ENUM_TIMEFRAMES tf, int shift) { return iLow(_Symbol, tf, shift); }
double C(ENUM_TIMEFRAMES tf, int shift) { return iClose(_Symbol, tf, shift); }
datetime T(ENUM_TIMEFRAMES tf, int shift) { return iTime(_Symbol, tf, shift); }

//+------------------------------------------------------------------+
int OnInit()
{
   atrHandle = iATR(_Symbol, InpEntryTF, InpAtrPeriod);
   if(atrHandle == INVALID_HANDLE)
   {
      Print("Erreur creation ATR.");
      return INIT_FAILED;
   }

   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetTypeFillingBySymbol(_Symbol);

   if(InpResetHaltState)
      GlobalVariableDel(GVHalted());

   if(GlobalVariableCheck(GVInitBal()))
      initialBalance = GlobalVariableGet(GVInitBal());
   else
   {
      initialBalance = AccountInfoDouble(ACCOUNT_BALANCE);
      GlobalVariableSet(GVInitBal(), initialBalance);
   }

   if(GlobalVariableCheck(GVHalted()) && GlobalVariableGet(GVHalted()) > 0.5)
   {
      tradingHalted = true;
      Print("EA demarre en etat ARRETE. Passe InpResetHaltState=true pour reactiver.");
   }

   if(GlobalVariableCheck(GVDayStart()))
   {
      lastDayStart    = (datetime)GlobalVariableGet(GVDayStart());
      dayStartBalance = GlobalVariableGet(GVDayBal());
   }

   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   IndicatorRelease(atrHandle);
}

//+------------------------------------------------------------------+
void Halt(string reason)
{
   tradingHalted = true;
   GlobalVariableSet(GVHalted(), 1.0);
   CloseAllPositions();
   Print("!!! ARRET D'URGENCE DU ROBOT : ", reason, " !!!");
}

//+------------------------------------------------------------------+
void CloseAllPositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol) continue;
      if((ulong)PositionGetInteger(POSITION_MAGIC) != InpMagicNumber) continue;
      trade.PositionClose(ticket);
   }
}

//+------------------------------------------------------------------+
void UpdateDailyReference()
{
   datetime currentDayStart = iTime(_Symbol, PERIOD_D1, 0);
   if(currentDayStart != lastDayStart)
   {
      lastDayStart    = currentDayStart;
      dayStartBalance = AccountInfoDouble(ACCOUNT_BALANCE);
      GlobalVariableSet(GVDayStart(), (double)lastDayStart);
      GlobalVariableSet(GVDayBal(), dayStartBalance);
   }
}

bool DailyLossLimitHit()
{
   if(dayStartBalance <= 0) return false;
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   return (dayStartBalance - equity) / dayStartBalance * 100.0 >= InpDailyLossLimitPct;
}

bool MaxDrawdownHit()
{
   if(initialBalance <= 0) return false;
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   return (initialBalance - equity) / initialBalance * 100.0 >= InpMaxDrawdownPct;
}

//+------------------------------------------------------------------+
// Fair Value Gap : pattern a 3 bougies. Pour 3 bougies cloturees consecutives
// (la plus ancienne en shift s+2, celle du milieu en s+1, la plus recente en s) :
// FVG haussier si le bas de la bougie recente est au-dessus du haut de l'ancienne.
bool IsBullishFVG(ENUM_TIMEFRAMES tf, int s)
{
   return L(tf, s) > H(tf, s + 2);
}
bool IsBearishFVG(ENUM_TIMEFRAMES tf, int s)
{
   return H(tf, s) < L(tf, s + 2);
}

//+------------------------------------------------------------------+
bool IsSwingHigh(ENUM_TIMEFRAMES tf, int s, int n)
{
   if(s - n < 1) return false;
   double v = H(tf, s);
   for(int i = 1; i <= n; i++)
   {
      if(H(tf, s - i) >= v) return false;
      if(H(tf, s + i) >= v) return false;
   }
   return true;
}
bool IsSwingLow(ENUM_TIMEFRAMES tf, int s, int n)
{
   if(s - n < 1) return false;
   double v = L(tf, s);
   for(int i = 1; i <= n; i++)
   {
      if(L(tf, s - i) <= v) return false;
      if(L(tf, s + i) <= v) return false;
   }
   return true;
}

double GetLastConfirmedSwingHigh(ENUM_TIMEFRAMES tf, int n)
{
   for(int s = n + 1; s < MAX_SCAN_BARS; s++)
      if(IsSwingHigh(tf, s, n)) return H(tf, s);
   return 0.0;
}
double GetLastConfirmedSwingLow(ENUM_TIMEFRAMES tf, int n)
{
   for(int s = n + 1; s < MAX_SCAN_BARS; s++)
      if(IsSwingLow(tf, s, n)) return L(tf, s);
   return 0.0;
}

//+------------------------------------------------------------------+
// Biais HTF : on cherche le FVG le plus recent qui n'a pas ete "mitige"
// (= dont la zone n'a pas ete entierement retraversee par le prix depuis).
void UpdateHTFBias()
{
   datetime currentBar = T(InpHTF, 0);
   if(currentBar == lastHtfBarTime) return;
   lastHtfBarTime = currentBar;

   for(int s = 1; s <= InpFVGLookbackBars; s++)
   {
      if(IsBullishFVG(InpHTF, s))
      {
         double gapBottom = H(InpHTF, s + 2);
         bool mitigated = false;
         for(int i = 1; i < s; i++)
            if(L(InpHTF, i) <= gapBottom) { mitigated = true; break; }
         if(!mitigated) { htfBias = 1; return; }
      }
      if(IsBearishFVG(InpHTF, s))
      {
         double gapTop = L(InpHTF, s + 2);
         bool mitigated = false;
         for(int i = 1; i < s; i++)
            if(H(InpHTF, i) >= gapTop) { mitigated = true; break; }
         if(!mitigated) { htfBias = -1; return; }
      }
   }
   // aucun FVG non-mitige trouve dans la fenetre : on garde le biais precedent
}

//+------------------------------------------------------------------+
void UpdateStructureKeyLevels()
{
   datetime currentBar = T(InpStructureTF, 0);
   if(currentBar == lastStructBarTime) return;
   lastStructBarTime = currentBar;

   double h = GetLastConfirmedSwingHigh(InpStructureTF, InpSwingLookback);
   double l = GetLastConfirmedSwingLow(InpStructureTF, InpSwingLookback);
   if(h > 0) keyLevelHigh = h;
   if(l > 0) keyLevelLow  = l;
}

//+------------------------------------------------------------------+
// Change of character sur la timeframe de confirmation : si le prix cloture
// au-dela du dernier swing oppose au biais actuel, on considere que la
// tendance a change et on inverse le biais.
void UpdateBiasInvalidation()
{
   datetime currentBar = T(InpConfirmTF, 0);
   if(currentBar == lastConfirmBarTime) return;
   lastConfirmBarTime = currentBar;

   double swingLow  = GetLastConfirmedSwingLow(InpConfirmTF, InpSwingLookback);
   double swingHigh = GetLastConfirmedSwingHigh(InpConfirmTF, InpSwingLookback);
   if(swingLow > 0)  confirmSwingLow  = swingLow;
   if(swingHigh > 0) confirmSwingHigh = swingHigh;

   double lastClose = C(InpConfirmTF, 1);
   if(htfBias == 1 && confirmSwingLow > 0 && lastClose < confirmSwingLow)
   {
      htfBias = -1;
      awaitingInverseFVG = false; // le setup en attente n'est plus valide
   }
   else if(htfBias == -1 && confirmSwingHigh > 0 && lastClose > confirmSwingHigh)
   {
      htfBias = 1;
      awaitingInverseFVG = false;
   }
}

//+------------------------------------------------------------------+
bool InSession()
{
   if(!InpUseSessionFilter) return true;
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   if(InpSessionStartHour <= InpSessionEndHour)
      return (dt.hour >= InpSessionStartHour && dt.hour < InpSessionEndHour);
   return (dt.hour >= InpSessionStartHour || dt.hour < InpSessionEndHour);
}

bool PastDailyCloseTime()
{
   if(!InpCloseBeforeDailyClose) return false;
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   return dt.hour >= InpDailyCloseHour;
}

//+------------------------------------------------------------------+
double ComputeLotSize(double stopDistancePrice, double riskAmount)
{
   double tickValue = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double tickSize  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   if(tickSize <= 0 || tickValue <= 0 || stopDistancePrice <= 0) return 0.0;

   double lossPerLot = (stopDistancePrice / tickSize) * tickValue;
   if(lossPerLot <= 0) return 0.0;

   double lots = riskAmount / lossPerLot;
   double minLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double maxLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   double lotStep = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);

   lots = MathFloor(lots / lotStep) * lotStep;
   lots = MathMax(minLot, MathMin(maxLot, lots));
   return lots;
}

//+------------------------------------------------------------------+
bool HasOpenPosition(long &direction)
{
   if(!PositionSelect(_Symbol)) { direction = 0; return false; }
   if((ulong)PositionGetInteger(POSITION_MAGIC) != InpMagicNumber) { direction = 0; return false; }
   direction = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? 1 : -1;
   return true;
}

//+------------------------------------------------------------------+
double GetAtrBuffer()
{
   double buf[];
   ArraySetAsSeries(buf, true);
   if(CopyBuffer(atrHandle, 0, 1, 1, buf) < 1) return 0.0;
   return buf[0] * InpStopBufferAtrMult;
}

//+------------------------------------------------------------------+
double PointsToPrice(double points) { return points * _Point; }

//+------------------------------------------------------------------+
void TryDetectSweep()
{
   double tolerance = PointsToPrice(InpKeyLevelTolerancePts);

   if(htfBias == 1 && keyLevelLow > 0)
   {
      double swingLow = GetLastConfirmedSwingLow(InpEntryTF, InpSwingLookback);
      if(swingLow > 0 && swingLow <= keyLevelLow + tolerance)
      {
         bool sweptAndRejected = (L(InpEntryTF, 1) <= swingLow) && (C(InpEntryTF, 1) > swingLow);
         if(sweptAndRejected)
         {
            awaitingInverseFVG = true;
            awaitingDirection  = 1;
            sweepExtreme       = L(InpEntryTF, 1);
            barsSinceSweep     = 0;
         }
      }
   }
   else if(htfBias == -1 && keyLevelHigh > 0)
   {
      double swingHigh = GetLastConfirmedSwingHigh(InpEntryTF, InpSwingLookback);
      if(swingHigh > 0 && swingHigh >= keyLevelHigh - tolerance)
      {
         bool sweptAndRejected = (H(InpEntryTF, 1) >= swingHigh) && (C(InpEntryTF, 1) < swingHigh);
         if(sweptAndRejected)
         {
            awaitingInverseFVG = true;
            awaitingDirection  = -1;
            sweepExtreme       = H(InpEntryTF, 1);
            barsSinceSweep     = 0;
         }
      }
   }
}

//+------------------------------------------------------------------+
void TryEnterOnInverseFVG()
{
   barsSinceSweep++;
   if(barsSinceSweep > InpMaxSweepSearchBars)
   {
      awaitingInverseFVG = false; // le setup a expire sans confirmation
      return;
   }

   bool foundFVG = (awaitingDirection == 1) ? IsBullishFVG(InpEntryTF, 1) : IsBearishFVG(InpEntryTF, 1);
   if(!foundFVG) return;

   double riskAmount = AccountInfoDouble(ACCOUNT_BALANCE) * (InpRiskPerTradePct / 100.0);
   double buffer = GetAtrBuffer();

   if(awaitingDirection == 1)
   {
      double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
      double sl  = sweepExtreme - buffer;
      double tp  = ask + (ask - sl) * InpRiskRewardRatio;
      double lots = ComputeLotSize(ask - sl, riskAmount);
      if(lots > 0) trade.Buy(lots, _Symbol, ask, sl, tp, "ICT NAS100 EA");
   }
   else
   {
      double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
      double sl  = sweepExtreme + buffer;
      double tp  = bid - (sl - bid) * InpRiskRewardRatio;
      double lots = ComputeLotSize(sl - bid, riskAmount);
      if(lots > 0) trade.Sell(lots, _Symbol, bid, sl, tp, "ICT NAS100 EA");
   }

   awaitingInverseFVG = false;
}

//+------------------------------------------------------------------+
void OnTick()
{
   if(tradingHalted) return;

   UpdateDailyReference();
   if(MaxDrawdownHit())
   {
      Halt(StringFormat("Drawdown total interne atteint (%.2f%%).", InpMaxDrawdownPct));
      return;
   }

   bool dailyLimitHit = DailyLossLimitHit();
   if(dailyLimitHit) CloseAllPositions();

   if(PastDailyCloseTime())
   {
      CloseAllPositions();
      return;
   }

   UpdateHTFBias();
   UpdateStructureKeyLevels();
   UpdateBiasInvalidation();

   datetime currentEntryBar = T(InpEntryTF, 0);
   if(currentEntryBar == lastEntryBarTime) return;
   lastEntryBarTime = currentEntryBar;

   long direction = 0;
   bool hasPosition = HasOpenPosition(direction);

   if(hasPosition)
   {
      // sortie anticipee si le biais s'est retourne contre la position
      if((direction == 1 && htfBias == -1) || (direction == -1 && htfBias == 1))
         CloseAllPositions();
      return;
   }

   if(dailyLimitHit || !InSession() || htfBias == 0) return;

   if(!awaitingInverseFVG)
      TryDetectSweep();
   else
      TryEnterOnInverseFVG();
}
