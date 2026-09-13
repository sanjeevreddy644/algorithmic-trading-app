import { Router } from "express";
import { listPositions } from "../controllers/position.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.get("/", requireAuth, asyncHandler(listPositions));

export default router;
