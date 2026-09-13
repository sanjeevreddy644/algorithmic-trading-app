import { Document, Schema, Types, model } from "mongoose";

export interface OrderLog { userId: Types.ObjectId; broker: string; mode: "paper"|"live"; action: "place"|"modify"|"cancel"; symbol: string; side?: "BUY"|"SELL"; quantity?: number; orderType?: string; variety?: string; brokerOrderId?: string; status: string; requestSummary?: Record<string, unknown>; responseSummary?: Record<string, unknown>; errorCode?: string; errorMessage?: string; createdAt: Date; updatedAt: Date; }
export type OrderLogDocument = OrderLog & Document;
const schema = new Schema<OrderLogDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, broker: {type:String,required:true}, mode:{type:String,enum:["paper","live"],required:true}, action:{type:String,enum:["place","modify","cancel"],required:true}, symbol:{type:String,required:true}, side:String, quantity:Number, orderType:String, variety:String, brokerOrderId:String, status:{type:String,required:true}, requestSummary:Schema.Types.Mixed, responseSummary:Schema.Types.Mixed, errorCode:String, errorMessage:String
}, {timestamps:true});
export const OrderLogModel = model<OrderLogDocument>("OrderLog", schema);
