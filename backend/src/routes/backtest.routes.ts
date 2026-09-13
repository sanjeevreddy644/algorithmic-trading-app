import { Router } from "express";
import { runBacktest } from "../controllers/backtest.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.post("/", requireAuth, asyncHandler(runBacktest));

export default router;
