import { UserDocument } from "../models/user.model";
import { paperAutomationService } from "./paper-automation.service";
export class PerformanceGateService { async evaluate(user:UserDocument){return paperAutomationService.validation(user);} }
export const performanceGateService=new PerformanceGateService();
