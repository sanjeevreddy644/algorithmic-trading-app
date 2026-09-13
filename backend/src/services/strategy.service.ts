export interface MarketBar { timestamp: Date; open:number; high:number; low:number; close:number; volume?:number; }
export interface StrategySignal { action:"buy"|"sell"|"hold"; confidence:number; reason:string; entryPrice?:number; stopPrice?:number; targetPrice?:number; referenceRangeHigh?:number; referenceRangeLow?:number; vwap?:number; vwapDeviationPercent?:number; }
export interface IntradayStrategyOptions { vwapDeviationPercent?:number; rewardRiskRatio?:number; stopDistancePercent?:number; }
function calcVwap(bars:MarketBar[]){let pv=0,v=0;for(const b of bars){const vol=Math.max(0,Number(b.volume||0));pv+=((b.high+b.low+b.close)/3)*vol;v+=vol;}return v?pv/v:(bars.at(-1)?.close||0);}
export class StrategyService {
 generateSignal(symbol:string,bars:MarketBar[],o:IntradayStrategyOptions={}):StrategySignal{
  if(bars.length<4)return {action:"hold",confidence:0,reason:`${symbol}: need at least 4 completed bars`};
  const deviation=o.vwapDeviationPercent??0.5,rr=o.rewardRiskRatio??2,stopPct=o.stopDistancePercent??0.5,current=bars.at(-1)!;
  const previous=bars.slice(-4,-1),high=Math.max(...previous.map(b=>b.high)),low=Math.min(...previous.map(b=>b.low)),vwap=calcVwap(bars),dev=vwap?((current.close-vwap)/vwap)*100:0;
  let action:"buy"|"sell"|"hold"="hold",confidence=0,reason=`${symbol}: no breakout or VWAP trigger`;
  if(current.close>high){action="buy";confidence=.8;reason=`${symbol}: breakout above previous 15-minute range high ${high.toFixed(2)}`;}
  else if(current.close<low){action="sell";confidence=.8;reason=`${symbol}: breakdown below previous 15-minute range low ${low.toFixed(2)}`;}
  else if(dev>=deviation){action="buy";confidence=.65;reason=`${symbol}: bullish VWAP deviation ${dev.toFixed(2)}%`;}
  else if(dev<=-deviation){action="sell";confidence=.65;reason=`${symbol}: bearish VWAP deviation ${dev.toFixed(2)}%`;}
  if(action==="hold")return {action,confidence,reason,referenceRangeHigh:high,referenceRangeLow:low,vwap,vwapDeviationPercent:dev};
  const entryPrice=current.close,stopPrice=action==="buy"?entryPrice*(1-stopPct/100):entryPrice*(1+stopPct/100),risk=Math.abs(entryPrice-stopPrice),targetPrice=action==="buy"?entryPrice+risk*rr:entryPrice-risk*rr;
  return {action,confidence,reason,entryPrice,stopPrice,targetPrice,referenceRangeHigh:high,referenceRangeLow:low,vwap,vwapDeviationPercent:dev};
 }
}
