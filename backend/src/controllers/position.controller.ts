import { Request, Response } from "express";
import { PositionModel } from "../models/position.model";
import { AppError } from "../utils/errors";

export async function listPositions(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  const positions = await PositionModel.find({ userId: req.user._id }).sort({
    symbol: 1
  });

  res.json({ positions });
}
