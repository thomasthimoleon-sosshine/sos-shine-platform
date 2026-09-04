//+------------------------------------------------------------------+
//| EA_FTMO_TTS_US30.mq5                                             |
//| Robot base sur la technique du pere de l'utilisateur, sur US30.  |
//| Confluence SAR + RSI(50) + TTS (indicateur "Trend Trader         |
//| Strategy" de TradingView, reproduit ici a l'identique en MQL5)   |
//| dans une fenetre de 15 minutes. SL sur le point de retournement  |
//| du SAR (ajuste par l'amplitude), TP1 a 1RR (cloture moitie +     |
//| breakeven), TP2 a 2RR.                                            |
//|                                                                    |
//| CE QUI VIENT DIRECTEMENT DU PERE (pas d'interpretation) :        |
//| - Confluence SAR + RSI + TTS sous 15 minutes                     |
//| - RSI : condition sur le niveau 50                                |
//| - SL = point de retournement du SAR                               |
//| - Amplitude < 40 pts -> SL plancher 40 pts                        |
//| - Amplitude > 100 pts -> SL divise par 2                          |
//| - TP1 = 1RR, cloture moitie de la position + stop a breakeven     |
//| - TP2 = 2RR                                                       |
//| - EMA 8/21 : renforce mais optionnel                              |
//| - Code source exact du TTS (indicateur TradingView "Trend Trader  |
//|   Strategy" par HPotter) fourni par l'utilisateur, traduit ici    |
//|   calcul par calcul                                               |
//|                                                                    |
//| CE QUE J'AI DU DECIDER MOI-MEME (voir README) :                   |
//| - Reglages SAR (step/maximum) : valeurs par defaut standard        |
//| - Periode RSI : 14 (standard, seul le niveau 50 etait precise)     |
//| - Risque par trade (% du solde) : pas precise par le pere          |
//| - Fermeture avant cloture quotidienne (US30 n'est pas 24h/24)      |
//+------------------------------------------------------------------+
#property copyright "SOS Shine"
#property version   "1.00"
#property strict

#include <Trade\Trade.mqh>

//--- Confluence (SAR + RSI + TTS dans une fenetre de X minutes)
input int    InpConfluenceWindowMin = 15;   // fenetre max entre les 3 signaux, en minutes
input double InpSarStep             = 0.02; // reglage standard, non precise par le pere
input double InpSarMax              = 0.2;
input int    InpRsiPeriod           = 14;   // standard, seul le niveau 50 etait precise
input int    InpTtsLength           = 21;   // parametres d'origine du script TradingView
input double InpTtsMultiplier       = 3.0;

//--- Renfort optionnel EMA 8/21 (facultatif selon le pere)
input bool   InpUseEmaFilter = false;
input int    InpEmaFast      = 8;
input int    InpEmaSlow      = 21;

//--- Regles de stop-loss / take-profit du pere
input double InpAmplitudeFloorPts = 40.0;  // SL plancher si l'amplitude est plus petite
input double InpAmplitudeCapPts   = 100.0; // au-dela, on divise l'amplitude par 2 pour le SL

//--- Gestion du risque (pas precisee par le pere, choix par defaut)
input double InpRiskPerTradePct   = 0.5;
input double InpDailyLossLimitPct = 2.0;
input double InpMaxDrawdownPct    = 6.0;
input bool   InpCloseBeforeDailyClose = true;
input int    InpDailyCloseHour        = 21; // heure serveur

//--- Frequence de trading
input int    InpMaxTradesPerDay = 3;
input int    InpMaxTotalTrades  = 10;

//--- Divers
input ulong  InpMagicNumber       = 990033;
input bool   InpResetHaltState    = false;
input bool   InpResetTradeCounter = false;

#define TF PERIOD_M5

CTrade trade;
int sarHandle = INVALID_HANDLE;
int rsiHandle = INVALID_HANDLE;
int emaFastHandle = INVALID_HANDLE;
int emaSlowHandle = INVALID_HANDLE;

datetime lastBarTime  = 0;
datetime lastDayStart = 0;
double   dayStartBalance = 0.0;
double   initialBalance  = 0.0;
bool     tradingHalted   = false;
int      tradesToday = 0;
int      totalTrades  = 0;

//--- Etat recursif du TTS (identique a la logique Pine ret/pos)
double ttsRet = 0.0;
int    ttsPos = 0;

//--- Horodatage du dernier signal dans chaque sens, pour la confluence 15 min
datetime lastSarBullTime = 0, lastSarBearTime = 0;
datetime lastRsiBullTime = 0, lastRsiBearTime = 0;
datetime lastTtsBullTime = 0, lastTtsBearTime = 0;

//--- Suivi de la position ouverte (un seul trade a la fois)
bool   tp1Taken = false;
double tp1Price = 0.0, tp2Price = 0.0;

string GVPrefix()      { return "FTMO_TTS_" + _Symbol + "_" + IntegerToString(InpMagicNumber) + "_"; }
string GVInitBal()     { return GVPrefix() + "InitialBalance"; }
string GVDayStart()    { return GVPrefix() + "DayStart"; }
string GVDayBal()      { return GVPrefix() + "DayStartBalance"; }
string GVHalted()      { return GVPrefix() + "Halted"; }
string GVTradesToday() { return GVPrefix() + "TradesToday"; }
string GVTotalTrades() { return GVPrefix() + "TotalTrades"; }

double H(int shift) { return iHigh(_Symbol, TF, shift); }
double L(int shift) { return iLow(_Symbol, TF, shift); }
double C(int shift) { return iClose(_Symbol, TF, shift); }

//+------------------------------------------------------------------+
double TrueRange(int shift)
{
   return MathMax(H(shift) - L(shift), MathMax(MathAbs(H(shift) - C(shift + 1)), MathAbs(L(shift) - C(shift + 1))));
}

// WMA (moyenne mobile ponderee) du True Range, fenetre de 'length' bougies
// se terminant a 'endShift' (endShift = la plus recente de la fenetre).
double WmaTR(int length, int endShift)
{
   double sum = 0, weightSum = 0;
   for(int i = 0; i < length; i++)
   {
      double w = length - i;
      sum += TrueRange(endShift + i) * w;
      weightSum += w;
   }
   return (weightSum > 0) ? sum / weightSum : 0.0;
}

double HighestHighWindow(int length, int endShift)
{
   double m = H(endShift);
   for(int i = 1; i < length; i++) m = MathMax(m, H(endShift + i));
   return m;
}
double LowestLowWindow(int length, int endShift)
{
   double m = L(endShift);
   for(int i = 1; i < length; i++) m = MathMin(m, L(endShift + i));
   return m;
}

//+------------------------------------------------------------------+
int OnInit()
{
   sarHandle     = iSAR(_Symbol, TF, InpSarStep, InpSarMax);
   rsiHandle     = iRSI(_Symbol, TF, InpRsiPeriod, PRICE_CLOSE);
   if(InpUseEmaFilter)
   {
      emaFastHandle = iMA(_Symbol, TF, InpEmaFast, 0, MODE_EMA, PRICE_CLOSE);
      emaSlowHandle = iMA(_Symbol, TF, InpEmaSlow, 0, MODE_EMA, PRICE_CLOSE);
   }

   if(sarHandle == INVALID_HANDLE || rsiHandle == INVALID_HANDLE ||
      (InpUseEmaFilter && (emaFastHandle == INVALID_HANDLE || emaSlowHandle == INVALID_HANDLE)))
   {
      Print("Erreur creation des indicateurs.");
      return INIT_FAILED;
   }

   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetTypeFillingBySymbol(_Symbol);

   if(InpResetHaltState) GlobalVariableDel(GVHalted());
   if(InpResetTradeCounter) GlobalVariableDel(GVTotalTrades());

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
   if(GlobalVariableCheck(GVTotalTrades())) totalTrades = (int)GlobalVariableGet(GVTotalTrades());
   if(GlobalVariableCheck(GVTradesToday())) tradesToday = (int)GlobalVariableGet(GVTradesToday());

   // Si l'EA redemarre avec une position deja ouverte dont le SL est deja
   // au prix d'entree, on suppose que TP1 avait deja ete pris (heuristique).
   if(PositionSelect(_Symbol) && (ulong)PositionGetInteger(POSITION_MAGIC) == InpMagicNumber)
   {
      double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
      double sl = PositionGetDouble(POSITION_SL);
      if(MathAbs(sl - openPrice) < 10 * _Point) tp1Taken = true;
   }

   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   IndicatorRelease(sarHandle);
   IndicatorRelease(rsiHandle);
   if(InpUseEmaFilter)
   {
      IndicatorRelease(emaFastHandle);
      IndicatorRelease(emaSlowHandle);
   }
}

//+------------------------------------------------------------------+
void Halt(string reason)
{
   tradingHalted = true;
   GlobalVariableSet(GVHalted(), 1.0);
   CloseAllPositions();
   Print("!!! ARRET D'URGENCE DU ROBOT : ", reason, " !!!");
}

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
   tp1Taken = false;
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
      tradesToday = 0;
      GlobalVariableSet(GVTradesToday(), 0.0);
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
bool PastDailyCloseTime()
{
   if(!InpCloseBeforeDailyClose) return false;
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   return dt.hour >= InpDailyCloseHour;
}

bool CanOpenNewTrade()
{
   if(InpMaxTradesPerDay > 0 && tradesToday >= InpMaxTradesPerDay) return false;
   if(InpMaxTotalTrades > 0 && totalTrades >= InpMaxTotalTrades) return false;
   return true;
}
void RegisterTradeOpened()
{
   tradesToday++;
   totalTrades++;
   GlobalVariableSet(GVTradesToday(), (double)tradesToday);
   GlobalVariableSet(GVTotalTrades(), (double)totalTrades);
}

//+------------------------------------------------------------------+
double NormalizeVolume(double vol)
{
   double minLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double maxLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   double lotStep = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   vol = MathFloor(vol / lotStep) * lotStep;
   return MathMax(minLot, MathMin(maxLot, vol));
}

double ComputeLotSize(double stopDistancePrice, double riskAmount)
{
   double tickValue = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double tickSize  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   if(tickSize <= 0 || tickValue <= 0 || stopDistancePrice <= 0) return 0.0;
   double lossPerLot = (stopDistancePrice / tickSize) * tickValue;
   if(lossPerLot <= 0) return 0.0;
   return NormalizeVolume(riskAmount / lossPerLot);
}

//+------------------------------------------------------------------+
// Reproduction exacte de l'indicateur TradingView "Trend Trader Strategy"
// (HPotter, d'apres Andrew Abraham). Appelee une fois par nouvelle bougie M5.
void UpdateTTS(datetime barTime)
{
   double avgTR_1     = WmaTR(InpTtsLength, 2);
   double highestC_1  = HighestHighWindow(InpTtsLength, 2);
   double lowestC_1   = LowestLowWindow(InpTtsLength, 2);

   double hiLimit = highestC_1 - avgTR_1 * InpTtsMultiplier;
   double loLimit = lowestC_1 + avgTR_1 * InpTtsMultiplier;
   double closeNow = C(1);

   double newRet;
   if(closeNow > hiLimit && closeNow > loLimit) newRet = hiLimit;
   else if(closeNow < loLimit && closeNow < hiLimit) newRet = loLimit;
   else newRet = (ttsRet != 0.0) ? ttsRet : closeNow;

   int newPos;
   if(closeNow > newRet) newPos = 1;
   else if(closeNow < newRet) newPos = -1;
   else newPos = ttsPos;

   if(newPos == 1 && ttsPos != 1) lastTtsBullTime = barTime;
   if(newPos == -1 && ttsPos != -1) lastTtsBearTime = barTime;

   ttsRet = newRet;
   ttsPos = newPos;
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
// Gestion TP1 (1RR, cloture moitie + breakeven) / TP2 (2RR, cloture totale).
// Appelee a CHAQUE tick pour reagir des que le prix atteint un palier.
void ManageOpenPosition()
{
   long direction = 0;
   if(!HasOpenPosition(direction)) return;

   ulong ticket = PositionGetInteger(POSITION_TICKET);
   double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
   double volume = PositionGetDouble(POSITION_VOLUME);
   double price = (direction == 1) ? SymbolInfoDouble(_Symbol, SYMBOL_BID) : SymbolInfoDouble(_Symbol, SYMBOL_ASK);

   if(!tp1Taken)
   {
      bool tp1Hit = (direction == 1) ? (price >= tp1Price) : (price <= tp1Price);
      if(tp1Hit)
      {
         double halfVol = NormalizeVolume(volume / 2.0);
         if(halfVol > 0 && halfVol < volume)
            trade.PositionClosePartial(ticket, halfVol);
         trade.PositionModify(ticket, openPrice, PositionGetDouble(POSITION_TP)); // stop -> breakeven
         tp1Taken = true;
      }
   }
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

   ManageOpenPosition(); // a chaque tick, pour ne pas rater un TP1 intra-bougie

   datetime currentBarTime = iTime(_Symbol, TF, 0);
   if(currentBarTime == lastBarTime) return;
   lastBarTime = currentBarTime;

   datetime evalBarTime = iTime(_Symbol, TF, 1); // la bougie qui vient de se cloturer

   // --- SAR : detection du retournement ---
   double sarBuf[];
   ArraySetAsSeries(sarBuf, true);
   if(CopyBuffer(sarHandle, 0, 1, 2, sarBuf) < 2) return;
   bool sarBullNow  = sarBuf[0] < C(1);
   bool sarBullPrev = sarBuf[1] < C(2);
   if(sarBullNow && !sarBullPrev) lastSarBullTime = evalBarTime;
   if(!sarBullNow && sarBullPrev) lastSarBearTime = evalBarTime;
   double sarCurrentValue = sarBuf[0];

   // --- RSI : croisement du niveau 50 ---
   double rsiBuf[];
   ArraySetAsSeries(rsiBuf, true);
   if(CopyBuffer(rsiHandle, 0, 1, 2, rsiBuf) < 2) return;
   bool rsiCrossUp   = rsiBuf[1] <= 50 && rsiBuf[0] > 50;
   bool rsiCrossDown = rsiBuf[1] >= 50 && rsiBuf[0] < 50;
   if(rsiCrossUp) lastRsiBullTime = evalBarTime;
   if(rsiCrossDown) lastRsiBearTime = evalBarTime;

   // --- TTS ---
   int prevPos = ttsPos;
   UpdateTTS(evalBarTime);

   long direction = 0;
   bool hasPosition = HasOpenPosition(direction);
   if(hasPosition) return; // gestion de sortie deja faite dans ManageOpenPosition()

   if(dailyLimitHit || !CanOpenNewTrade()) return;

   long windowSec = (long)InpConfluenceWindowMin * 60;
   bool bullConfluence = lastSarBullTime > 0 && lastRsiBullTime > 0 && lastTtsBullTime > 0 &&
                          (evalBarTime - lastSarBullTime) <= windowSec &&
                          (evalBarTime - lastRsiBullTime) <= windowSec &&
                          (evalBarTime - lastTtsBullTime) <= windowSec;
   bool bearConfluence = lastSarBearTime > 0 && lastRsiBearTime > 0 && lastTtsBearTime > 0 &&
                          (evalBarTime - lastSarBearTime) <= windowSec &&
                          (evalBarTime - lastRsiBearTime) <= windowSec &&
                          (evalBarTime - lastTtsBearTime) <= windowSec;

   bool justCompletedBull = bullConfluence && (sarBullNow && !sarBullPrev || rsiCrossUp || (ttsPos == 1 && prevPos != 1));
   bool justCompletedBear = bearConfluence && ((!sarBullNow && sarBullPrev) || rsiCrossDown || (ttsPos == -1 && prevPos != -1));

   if(InpUseEmaFilter)
   {
      double emaFastBuf[], emaSlowBuf[];
      ArraySetAsSeries(emaFastBuf, true);
      ArraySetAsSeries(emaSlowBuf, true);
      if(CopyBuffer(emaFastHandle, 0, 1, 1, emaFastBuf) < 1) return;
      if(CopyBuffer(emaSlowHandle, 0, 1, 1, emaSlowBuf) < 1) return;
      if(justCompletedBull && emaFastBuf[0] <= emaSlowBuf[0]) justCompletedBull = false;
      if(justCompletedBear && emaFastBuf[0] >= emaSlowBuf[0]) justCompletedBear = false;
   }

   if(!justCompletedBull && !justCompletedBear) return;

   double entryPrice = justCompletedBull ? SymbolInfoDouble(_Symbol, SYMBOL_ASK) : SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double amplitude = MathAbs(entryPrice - sarCurrentValue); // en "points" = unites de prix brutes

   double slDistance;
   if(amplitude < InpAmplitudeFloorPts) slDistance = InpAmplitudeFloorPts;
   else if(amplitude > InpAmplitudeCapPts) slDistance = amplitude / 2.0;
   else slDistance = amplitude;

   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double riskAmount = balance * (InpRiskPerTradePct / 100.0);
   double lots = ComputeLotSize(slDistance, riskAmount);
   if(lots <= 0) return;

   if(justCompletedBull)
   {
      double sl = entryPrice - slDistance;
      tp1Price = entryPrice + slDistance;       // 1RR
      tp2Price = entryPrice + slDistance * 2.0; // 2RR
      if(trade.Buy(lots, _Symbol, entryPrice, sl, tp2Price, "TTS US30 EA"))
      {
         tp1Taken = false;
         RegisterTradeOpened();
      }
   }
   else if(justCompletedBear)
   {
      double sl = entryPrice + slDistance;
      tp1Price = entryPrice - slDistance;
      tp2Price = entryPrice - slDistance * 2.0;
      if(trade.Sell(lots, _Symbol, entryPrice, sl, tp2Price, "TTS US30 EA"))
      {
         tp1Taken = false;
         RegisterTradeOpened();
      }
   }
}
