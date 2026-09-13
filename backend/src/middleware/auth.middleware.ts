import { NextFunction, Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { AppError } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw new AppError(401, "Missing bearer token");
    }

    const token = header.slice("Bearer ".length);
    const payload = verifyAccessToken(token);

    const user = await UserModel.findById(payload.sub);

    if (!user) {
      throw new AppError(401, "User not found");
    }

    req.user = user;
    next();
  } catch {
    next(new AppError(401, "Invalid or expired access token"));
  }
}
