import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import {
  login,
  me,
  refresh,
  register
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.get("/me", requireAuth, asyncHandler(me));

export default router;
