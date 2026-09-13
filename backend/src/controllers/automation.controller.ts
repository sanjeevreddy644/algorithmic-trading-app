import { Request, Response } from "express";
import { AppError } from "../utils/errors";
import { paperAutomationService } from "../services/paper-automation.service";
export async function getAutomation(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");res.json(await paperAutomationService.snapshot(req.user));}
export async function setAutomation(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");if(typeof req.body?.enabled!=="boolean")throw new AppError(400,"enabled must be boolean");res.json(await paperAutomationService.setEnabled(req.user,req.body.enabled));}
export async function resetAutomation(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");res.json({account:await paperAutomationService.resetDay(req.user,true)});}
export async function scanAutomation(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");res.json(await paperAutomationService.scanUser(req.user));}
