import { Request,Response } from "express";
import { brokerService } from "../services/brokers/broker.service";
import { AppError } from "../utils/errors";
export async function getSession(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");res.json({session:await brokerService.getSession(req.user)});}
export async function initiate(req:Request,res:Response){res.json(brokerService.initiateLogin());}
export async function refresh(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");res.json(await brokerService.exchangeRequestToken(req.user,String(req.body?.requestToken??"")));}
export async function callback(req:Request,res:Response){res.status(200).json({requestToken:req.query.request_token??null,message:"Authenticate this request token through the authenticated /api/broker/session/refresh endpoint."});}
export async function startStream(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");const symbols=Array.isArray(req.body?.instrumentTokens)?req.body.instrumentTokens.map(String):[];if(!symbols.length)throw new AppError(400,"instrumentTokens is required");await brokerService.startStream(req.user,symbols,(event:any)=>{void event;},(event:any)=>{void event;});res.json({started:true});}
export async function stopStream(req:Request,res:Response){if(!req.user)throw new AppError(401,"Authentication required");await brokerService.stopStream(req.user);res.json({stopped:true});}
