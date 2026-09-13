import {Request,Response} from "express";
import {AppError} from "../utils/errors";
import {TradeModel} from "../models/trade.model";
import {MetricModel} from "../models/metric.model";
import {ConfigurationModel} from "../models/configuration.model";
export async function trades(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");res.json({trades:await TradeModel.find({userId:req.user._id}).sort({createdAt:-1}).limit(100).lean()});}
export async function metrics(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");const metric=await MetricModel.findOne({userId:req.user._id}).sort({recordedAt:-1}).lean();res.json(metric||{equity:req.user.accountBalance,cash:req.user.accountBalance,drawdownPercent:0,dailyPnl:0});}
export async function getConfig(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");const configuration=await ConfigurationModel.findOne({userId:req.user._id}).sort({updatedAt:-1}).lean();res.json({configuration});}
export async function saveConfig(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");const b=req.body||{};const configuration=await ConfigurationModel.findOneAndUpdate({userId:req.user._id,name:b.name||"Dashboard Strategy"},{userId:req.user._id,name:b.name||"Dashboard Strategy",strategyName:b.strategyName||"regime-adaptive",parameters:b.parameters||{},enabled:Boolean(b.enabled)},{upsert:true,new:true,setDefaultsOnInsert:true});res.json({configuration});}
