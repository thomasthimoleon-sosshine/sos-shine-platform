//+------------------------------------------------------------------+
//| EA_FTMO_TrendFollow.mq5                                          |
//| Robot de suivi de tendance (EMA + RSI) pour challenge FTMO.      |
//| Long ET short. SL/TP poses cote broker. Coupe-circuits internes  |
//| plus stricts que les limites FTMO (perte journaliere, drawdown). |
//+------------------------------------------------------------------+
#property copyright "SOS Shine"
#property version   "1.00"
#property strict

#include <Trade\Trade.mqh>

//--- Parametres strategie
input int    InpEmaFast            = 12;
input int    InpEmaSlow            = 26;
input int    InpRsiPeriod          = 14;
input double InpRsiOverbought      = 75.0;
input double InpRsiOversold        = 25.0;
input int    InpAtrPeriod          = 14;
input double InpAtrStopMultiplier  = 2.0;
input double InpRiskRewardRatio    = 1.5;
input bool   InpAllowShort         = true;

//--- Gestion du risque
input double InpRiskPerTradePct     = 0.5;   // % du solde risque par trade
input double InpDailyLossLimitPct   = 2.0;   // coupe-circuit journalier interne (FTMO = 5%)
input double InpMaxDrawdownPct      = 6.0;   // coupe-circuit total interne (FTMO = 10%)
input bool   InpCloseBeforeWeekend  = true;
input int    InpWeekendCloseHour    = 20;    // heure serveur, vendredi, a partir de laquelle on ferme tout

//--- Frequence de trading
input int    InpMaxTradesPerDay    = 3;      // 0 = illimite. Combien de NOUVEAUX trades max par jour
input int    InpMaxTotalTrades     = 10;     // 0 = illimite. L'EA arrete d'ouvrir de nouveaux trades apres ce total (protection anti-surtrading)

//--- Divers
input ulong  InpMagicNumber   = 990011;
input bool   InpResetHaltState = false;      // repasser a true puis recompiler/relancer pour reactiver apres un arret d'urgence
input bool   InpResetTradeCounter = false;   // repasser a true puis relancer pour remettre le compteur total de trades a zero

CTrade trade;

int emaFastHandle = INVALID_HANDLE;
int emaSlowHandle = INVALID_HANDLE;
int rsiHandle     = INVALID_HANDLE;
int atrHandle     = INVALID_HANDLE;

datetime lastBarTime   = 0;
datetime lastDayStart  = 0;
double   dayStartBalance = 0.0;
double   initialBalance  = 0.0;
bool     tradingHalted   = false;
int      tradesToday     = 0;
int      totalTrades     = 0;

string GVPrefix()      { return "FTMO_EA_" + _Symbol + "_" + IntegerToString(InpMagicNumber) + "_"; }
string GVInitBal()     { return GVPrefix() + "InitialBalance"; }
string GVDayStart()    { return GVPrefix() + "DayStart"; }
string GVDayBal()      { return GVPrefix() + "DayStartBalance"; }
string GVHalted()      { return GVPrefix() + "Halted"; }
string GVTradesToday() { return GVPrefix() + "TradesToday"; }
string GVTotalTrades() { return GVPrefix() + "TotalTrades"; }

//+------------------------------------------------------------------+
int OnInit()
{
   emaFastHandle = iMA(_Symbol, PERIOD_CURRENT, InpEmaFast, 0, MODE_EMA, PRICE_CLOSE);
   emaSlowHandle = iMA(_Symbol, PERIOD_CURRENT, InpEmaSlow, 0, MODE_EMA, PRICE_CLOSE);
   rsiHandle     = iRSI(_Symbol, PERIOD_CURRENT, InpRsiPeriod, PRICE_CLOSE);
   atrHandle     = iATR(_Symbol, PERIOD_CURRENT, InpAtrPeriod);

   if(emaFastHandle == INVALID_HANDLE || emaSlowHandle == INVALID_HANDLE ||
      rsiHandle == INVALID_HANDLE || atrHandle == INVALID_HANDLE)
   {
      Print("Erreur creation des indicateurs.");
      return INIT_FAILED;
   }

   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetTypeFillingBySymbol(_Symbol);

   if(InpResetHaltState)
      GlobalVariableDel(GVHalted());

   // Capital de reference pour le drawdown total : fixe une fois pour toutes,
   // persiste meme si le terminal ou l'EA redemarre.
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
      Print("EA demarre en etat ARRETE (drawdown max deja atteint precedemment). ",
            "Passe InpResetHaltState=true pour reactiver, apres avoir compris pourquoi.");
   }

   if(GlobalVariableCheck(GVDayStart()))
   {
      lastDayStart    = (datetime)GlobalVariableGet(GVDayStart());
      dayStartBalance = GlobalVariableGet(GVDayBal());
   }

   if(InpResetTradeCounter)
      GlobalVariableDel(GVTotalTrades());

   if(GlobalVariableCheck(GVTotalTrades()))
      totalTrades = (int)GlobalVariableGet(GVTotalTrades());

   if(GlobalVariableCheck(GVTradesToday()))
      tradesToday = (int)GlobalVariableGet(GVTradesToday());

   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   IndicatorRelease(emaFastHandle);
   IndicatorRelease(emaSlowHandle);
   IndicatorRelease(rsiHandle);
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
// FTMO calcule la perte journaliere par rapport au solde de cloture de la
// veille : on s'aligne sur l'ouverture de la bougie journaliere (D1) plutot
// que sur minuit "horloge murale", ce qui correspond a ce que fait le broker.
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

//+------------------------------------------------------------------+
bool CanOpenNewTrade()
{
   if(InpMaxTradesPerDay > 0 && tradesToday >= InpMaxTradesPerDay) return false;
   if(InpMaxTotalTrades > 0 && totalTrades >= InpMaxTotalTrades) return false;
   return true;
}

//+------------------------------------------------------------------+
void RegisterTradeOpened()
{
   tradesToday++;
   totalTrades++;
   GlobalVariableSet(GVTradesToday(), (double)tradesToday);
   GlobalVariableSet(GVTotalTrades(), (double)totalTrades);

   if(InpMaxTotalTrades > 0 && totalTrades >= InpMaxTotalTrades)
      Print("Limite totale de trades atteinte (", InpMaxTotalTrades, "). Plus aucun nouveau trade ",
            "tant que InpResetTradeCounter n'est pas repasse a true.");
}

//+------------------------------------------------------------------+
bool DailyLossLimitHit()
{
   if(dayStartBalance <= 0) return false;
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double lossPct = (dayStartBalance - equity) / dayStartBalance * 100.0;
   return lossPct >= InpDailyLossLimitPct;
}

//+------------------------------------------------------------------+
bool MaxDrawdownHit()
{
   if(initialBalance <= 0) return false;
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double ddPct = (initialBalance - equity) / initialBalance * 100.0;
   return ddPct >= InpMaxDrawdownPct;
}

//+------------------------------------------------------------------+
bool IsWeekendCloseTime()
{
   if(!InpCloseBeforeWeekend) return false;
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   return (dt.day_of_week == 5 && dt.hour >= InpWeekendCloseHour); // vendredi
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
bool HasOpenPosition(long &direction) // 1 = achat, -1 = vente, 0 = aucune
{
   if(!PositionSelect(_Symbol)) { direction = 0; return false; }
   if((ulong)PositionGetInteger(POSITION_MAGIC) != InpMagicNumber) { direction = 0; return false; }
   direction = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? 1 : -1;
   return true;
}

//+------------------------------------------------------------------+
void OnTick()
{
   if(tradingHalted) return;

   datetime currentBarTime = iTime(_Symbol, PERIOD_CURRENT, 0);
   if(currentBarTime == lastBarTime) return; // on ne traite qu'une fois par bougie cloturee
   lastBarTime = currentBarTime;

   UpdateDailyReference();

   if(MaxDrawdownHit())
   {
      Halt(StringFormat("Drawdown total interne atteint (%.2f%%).", InpMaxDrawdownPct));
      return;
   }

   bool dailyLimitHit = DailyLossLimitHit();
   if(dailyLimitHit)
      CloseAllPositions(); // on coupe pour la journee, mais l'EA reste actif pour demain

   if(IsWeekendCloseTime())
   {
      CloseAllPositions();
      return;
   }

   double emaFast[], emaSlow[], rsiBuf[], atrBuf[];
   ArraySetAsSeries(emaFast, true);
   ArraySetAsSeries(emaSlow, true);
   ArraySetAsSeries(rsiBuf, true);
   ArraySetAsSeries(atrBuf, true);

   if(CopyBuffer(emaFastHandle, 0, 0, 3, emaFast) < 3) return;
   if(CopyBuffer(emaSlowHandle, 0, 0, 3, emaSlow) < 3) return;
   if(CopyBuffer(rsiHandle, 0, 0, 3, rsiBuf) < 3) return;
   if(CopyBuffer(atrHandle, 0, 0, 3, atrBuf) < 3) return;

   // index 1 = derniere bougie cloturee, index 2 = celle d'avant (evite le repaint)
   bool crossUp   = (emaFast[2] <= emaSlow[2]) && (emaFast[1] > emaSlow[1]);
   bool crossDown = (emaFast[2] >= emaSlow[2]) && (emaFast[1] < emaSlow[1]);
   double rsi = rsiBuf[1];
   double atr = atrBuf[1];

   long direction = 0;
   bool hasPosition = HasOpenPosition(direction);

   if(hasPosition)
   {
      if((direction == 1 && crossDown) || (direction == -1 && crossUp))
         CloseAllPositions(); // sortie sur retournement de tendance
      return;
   }

   if(dailyLimitHit) return; // pas de nouvelle position tant que la limite du jour est active
   if(!CanOpenNewTrade()) return; // plafond journalier ou total de trades atteint

   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double riskAmount = balance * (InpRiskPerTradePct / 100.0);

   if(crossUp && rsi < InpRsiOverbought)
   {
      double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
      double sl  = ask - atr * InpAtrStopMultiplier;
      double tp  = ask + (ask - sl) * InpRiskRewardRatio;
      double lots = ComputeLotSize(ask - sl, riskAmount);
      if(lots > 0 && trade.Buy(lots, _Symbol, ask, sl, tp, "FTMO EA trend-follow"))
         RegisterTradeOpened();
   }
   else if(InpAllowShort && crossDown && rsi > InpRsiOversold)
   {
      double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
      double sl  = bid + atr * InpAtrStopMultiplier;
      double tp  = bid - (sl - bid) * InpRiskRewardRatio;
      double lots = ComputeLotSize(sl - bid, riskAmount);
      if(lots > 0 && trade.Sell(lots, _Symbol, bid, sl, tp, "FTMO EA trend-follow"))
         RegisterTradeOpened();
   }
}
