import { KiteConnect, KiteTicker } from "kiteconnect";
import { env } from "../../config/env";
import { BrokerAdapter, BrokerOrderInput, SanitizedOrderEvent, SanitizedQuoteEvent } from "./types";

function requireConfig() { if (!env.zerodhaApiKey || !env.zerodhaApiSecret || !env.zerodhaRedirectUrl) throw new Error("Zerodha API configuration is incomplete"); }
function sanitizeQuote(tick:any): SanitizedQuoteEvent { return { type:"quote", symbol:String(tick.tradingsymbol ?? tick.instrument_token), lastPrice:typeof tick.last_price === "number" ? tick.last_price : undefined, volume:typeof tick.volume_traded === "number" ? tick.volume_traded : undefined, timestamp:new Date().toISOString() }; }
function sanitizeOrder(o:any): SanitizedOrderEvent { return { type:"order_update", orderId:o.order_id, status:o.status, symbol:o.tradingsymbol, side:o.transaction_type, quantity:o.quantity, timestamp:new Date().toISOString() }; }

class KiteAdapter {
  // One ticker per user; a single shared ticker let users replace or stop each other's streams.
  private readonly tickers = new Map<string, any>();
  generateLoginUrl() { requireConfig(); return `https://kite.zerodha.com/connect/login?v=3&api_key=${encodeURIComponent(env.zerodhaApiKey)}`; }
  async exchangeRequestToken(requestToken:string) { requireConfig(); if (!requestToken?.trim()) throw new Error("request_token is required"); const kite = new KiteConnect({api_key:env.zerodhaApiKey}); const response:any = await kite.generateSession(requestToken, env.zerodhaApiSecret); return {accessToken:response.access_token, userId:response.user_id, userName:response.user_name, email:response.email, broker:response.broker}; }
  private kiteWithToken(token:string) { requireConfig(); const kite = new KiteConnect({api_key:env.zerodhaApiKey}); kite.setAccessToken(token); return kite; }
  async placeOrder(input:BrokerOrderInput, token:string) { return this.placeOrderWithToken(token,input); }
  async modifyOrder(variety:string, orderId:string, input:Partial<BrokerOrderInput>, token:string) { return this.modifyOrderWithToken(token,variety,orderId,input); }
  async cancelOrder(variety:string, orderId:string, token:string) { return this.cancelOrderWithToken(token,variety,orderId); }
  async startMarketStream(symbols:string[], onQuote:(e:SanitizedQuoteEvent)=>void, onOrderUpdate:(e:SanitizedOrderEvent)=>void, token:string) { return this.startMarketStreamWithToken(token,symbols,onQuote,onOrderUpdate); }
  async stopMarketStream(key="default") { const ticker=this.tickers.get(key); if(ticker){ try{ticker.disconnect();}catch{} this.tickers.delete(key); } }
  async placeOrderWithToken(token:string,input:BrokerOrderInput){ const kite=this.kiteWithToken(token); const result:any=await kite.placeOrder(input.variety ?? "regular", input as any); return {orderId:String(result?.order_id ?? result)}; }
  async modifyOrderWithToken(token:string,variety:string,orderId:string,input:Partial<BrokerOrderInput>){ const kite=this.kiteWithToken(token); const result=await kite.modifyOrder(variety as any,orderId,input as any); return {orderId:String(result.order_id ?? result)}; }
  async cancelOrderWithToken(token:string,variety:string,orderId:string){ const kite=this.kiteWithToken(token); const result=await kite.cancelOrder(variety as any,orderId); return {orderId:String(result.order_id ?? result)}; }
  async getInstrumentsWithToken(token: string, exchange = "NSE"): Promise<any[]> {
    const kite = this.kiteWithToken(token);
    return kite.getInstruments(exchange as any);
  }

  async getHistoricalDataWithToken(token: string, instrumentToken: number, from: Date, to: Date, interval = "5minute"): Promise<any[]> {
    const kite = this.kiteWithToken(token);
    // Kite's signature is (instrument_token, interval, from_date, to_date).
    return kite.getHistoricalData(instrumentToken, interval as any, from, to);
  }

  async getQuoteWithToken(token: string, symbols: string[]): Promise<Record<string, any>> {
    const kite = this.kiteWithToken(token);
    return kite.getQuote(symbols);
  }

  async startMarketStreamWithToken(token:string,symbols:string[],onQuote:(e:SanitizedQuoteEvent)=>void,onOrderUpdate:(e:SanitizedOrderEvent)=>void,key="default"){ requireConfig(); await this.stopMarketStream(key); const ticker=new KiteTicker({api_key:env.zerodhaApiKey,access_token:token}); this.tickers.set(key,ticker); ticker.on("connect",()=>{ const instrumentTokens=symbols.map(s=>Number(s)).filter(Number.isFinite); if(instrumentTokens.length){ticker.subscribe(instrumentTokens); ticker.setMode(ticker.modeFull,instrumentTokens);} }); ticker.on("ticks",(ticks:any[])=>ticks.forEach(t=>onQuote(sanitizeQuote(t)))); ticker.on("order_update",(o:any)=>onOrderUpdate(sanitizeOrder(o))); ticker.autoReconnect(true, -1, Math.max(1, Math.round(env.wsReconnectBaseMs/1000))); ticker.on("disconnect",()=>{}); ticker.on("error",()=>{}); ticker.connect(); }
}
export const KiteBrokerAdapter = KiteAdapter;
export const kiteAdapter = new KiteAdapter();
export function createKiteChecksum(apiKey:string, requestToken:string, apiSecret:string):string { return require("crypto").createHash("sha256").update(apiKey + requestToken + apiSecret).digest("hex"); }
