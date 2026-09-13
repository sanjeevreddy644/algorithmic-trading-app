export type VolatilityState = "unknown"|"low"|"normal"|"high"|"extreme";
class MarketStateService { private readonly states=new Map<string,VolatilityState>(); getVolatility(symbol:string):VolatilityState{return this.states.get(symbol.toUpperCase())??"unknown";} setVolatility(symbol:string,state:VolatilityState){this.states.set(symbol.toUpperCase(),state);} }
export const marketStateService=new MarketStateService();
