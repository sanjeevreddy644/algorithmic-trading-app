import { Request, Response } from "express";
import { AppError } from "../utils/errors";
import { tradingModeService } from "../services/trading-mode.service";
export async function getMode(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");res.json(await tradingModeService.get(req.user));}
export async function setMode(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");const mode=req.body?.mode;if(mode!=="paper"&&mode!=="live")throw new AppError(400,"mode must be paper or live");res.json(await tradingModeService.set(req.user,mode,req.body?.confirmation));}
