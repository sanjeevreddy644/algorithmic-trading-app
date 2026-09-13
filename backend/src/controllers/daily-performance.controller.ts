import { Request, Response } from "express";
import { AppError } from "../utils/errors";
import { DailyPerformanceModel } from "../models/daily-performance.model";
export async function listDailyPerformance(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");const limit=Math.min(Math.max(Math.floor(Number(req.query.limit))||30,1),100);const rows=await DailyPerformanceModel.find({userId:req.user._id}).sort({tradingDate:-1}).limit(limit).lean();res.json({performance:rows.reverse()});}
