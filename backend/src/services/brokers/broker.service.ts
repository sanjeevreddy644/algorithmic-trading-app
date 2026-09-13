import { env } from "../../config/env";
import { BrokerSessionModel } from "../../models/broker-session.model";
import { UserDocument } from "../../models/user.model";
import { decryptSecret, encryptSecret } from "../../utils/secrets";
import { kiteAdapter } from "./kite.adapter";
import { AppError } from "../../utils/errors";

const BAR_MS = 5 * 60 * 1000;
const HISTORICAL_MIN_GAP_MS = 350;
const istDateKey = (d = new Date()) => new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(d);

export class BrokerService {
  async getSession(user:UserDocument){ const s=await BrokerSessionModel.findOne({userId:user._id,broker:"zerodha"}); if(!s)return null; return {id:s.id,broker:s.broker,accountId:s.accountId,status:s.status,lastConnectedAt:s.lastConnectedAt,expiresAt:s.expiresAt,websocketConnected:s.websocketConnected}; }
  initiateLogin(){ return {loginUrl:kiteAdapter.generateLoginUrl()}; }
  async exchangeRequestToken(user:UserDocument,requestToken:string){ const r=await kiteAdapter.exchangeRequestToken(requestToken); if(!env.tokenEncryptionKey) throw new Error("TOKEN_ENCRYPTION_KEY is required before storing broker sessions"); await BrokerSessionModel.findOneAndUpdate({userId:user._id,broker:"zerodha"},{userId:user._id,broker:"zerodha",accountId:r.userId,accountEmail:r.email,encryptedAccessToken:encryptSecret(r.accessToken),status:"connected",lastConnectedAt:new Date(),websocketConnected:false},{upsert:true,new:true,setDefaultsOnInsert:true}); return {connected:true,accountId:r.userId,accountEmail:r.email}; }
  async hasSession(user:UserDocument){ return Boolean(await BrokerSessionModel.exists({userId:user._id,broker:"zerodha",status:"connected"})); }
  async token(user:UserDocument){ const s=await BrokerSessionModel.findOne({userId:user._id,broker:"zerodha"}).select("+encryptedAccessToken"); if(!s?.encryptedAccessToken) throw new AppError(409,"Zerodha session is not connected"); return decryptSecret(s.encryptedAccessToken); }
  async startStream(user:UserDocument,symbols:string[],onQuote:any,onOrderUpdate:any){ const token=await this.token(user); await kiteAdapter.startMarketStreamWithToken(token,symbols,onQuote,onOrderUpdate,user.id); await BrokerSessionModel.updateOne({userId:user._id,broker:"zerodha"},{$set:{websocketConnected:true}}); }
  // The NSE instrument dump is several MB and only changes daily, so cache it per IST date.
  private instrumentCache?: { date:string; tokens:Map<string, number> };
  async getNifty50InstrumentMap(user:UserDocument, symbols:string[], token?:string) {
    const today = istDateKey();
    if (this.instrumentCache?.date !== today) {
      const instruments = await kiteAdapter.getInstrumentsWithToken(token ?? await this.token(user), "NSE");
      const tokens = new Map<string, number>();
      for (const item of instruments) tokens.set(String(item.tradingsymbol).toUpperCase(), Number(item.instrument_token));
      this.instrumentCache = { date: today, tokens };
    }
    const map = new Map<string, number>();
    for (const symbol of symbols) { const instrumentToken = this.instrumentCache.tokens.get(symbol.toUpperCase()); if (instrumentToken) map.set(symbol.toUpperCase(), instrumentToken); }
    return map;
  }

  async getLastPrices(user:UserDocument, symbols:string[], token?:string) {
    const prices = new Map<string, number>();
    if (!symbols.length) return prices;
    const quotes = await kiteAdapter.getQuoteWithToken(token ?? await this.token(user), symbols.map(s=>`NSE:${s.toUpperCase()}`));
    for (const symbol of symbols) { const lastPrice = Number(quotes[`NSE:${symbol.toUpperCase()}`]?.last_price); if (lastPrice > 0) prices.set(symbol.toUpperCase(), lastPrice); }
    return prices;
  }

  async getIntradayBars(user:UserDocument, instrumentToken:number, token?:string) {
    const now = new Date();
    // Midnight in IST regardless of the server's own timezone.
    const from = new Date(`${istDateKey(now)}T00:00:00+05:30`);
    await this.throttleHistorical();
    const bars = await kiteAdapter.getHistoricalDataWithToken(token ?? await this.token(user), instrumentToken, from, now, "5minute");
    // Kite includes the still-forming candle; the strategy expects completed bars only.
    return bars
      .map((b:any)=>({...b,timestamp:new Date(b.timestamp ?? b.date)}))
      .filter((b:any)=>b.timestamp.getTime()+BAR_MS<=now.getTime());
  }

  // Kite's historical API allows roughly 3 requests per second.
  private lastHistoricalCall = 0;
  private async throttleHistorical() {
    const wait = this.lastHistoricalCall + HISTORICAL_MIN_GAP_MS - Date.now();
    if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
    this.lastHistoricalCall = Date.now();
  }

  async stopStream(user:UserDocument){ await kiteAdapter.stopMarketStream(user.id); await BrokerSessionModel.updateOne({userId:user._id,broker:"zerodha"},{$set:{websocketConnected:false}}); }
  async place(user:UserDocument,input:any){return kiteAdapter.placeOrderWithToken(await this.token(user),input);}
  async modify(user:UserDocument,variety:string,orderId:string,input:any){return kiteAdapter.modifyOrderWithToken(await this.token(user),variety,orderId,input);}
  async cancel(user:UserDocument,variety:string,orderId:string){return kiteAdapter.cancelOrderWithToken(await this.token(user),variety,orderId);}
}
export const brokerService = new BrokerService();
