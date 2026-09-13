import { Router } from "express";
import { placeOrder } from "../controllers/trading.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as dashboard from "../controllers/trading-dashboard.controller";

const router = Router();

router.get("/trades", requireAuth, asyncHandler(dashboard.trades));
router.get("/metrics", requireAuth, asyncHandler(dashboard.metrics));
router.get("/config", requireAuth, asyncHandler(dashboard.getConfig));
router.post("/config", requireAuth, asyncHandler(dashboard.saveConfig));
router.post("/orders", requireAuth, asyncHandler(placeOrder));

export default router;
