import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { AppError } from "../utils/errors";
import { getUserIdFromRefreshToken, issueTokens } from "../services/token.service";

export async function register(req: Request, res: Response) {
  const { email, password, displayName } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    password.length < 8
  ) {
    throw new AppError(400, "Email and a password of at least 8 characters are required");
  }

  const existing = await UserModel.findOne({ email: email.trim().toLowerCase() });

  if (existing) {
    throw new AppError(409, "Email is already registered");
  }

  const passwordHash = await UserModel.hashPassword(password);
  const user = await UserModel.create({
    email,
    passwordHash,
    displayName
  });

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName
    },
    tokens: issueTokens(user)
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (typeof email !== "string" || typeof password !== "string") {
    throw new AppError(401, "Invalid email or password");
  }

  const user = await UserModel.findOne({ email: email.trim().toLowerCase() });

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, "Invalid email or password");
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName
    },
    tokens: issueTokens(user)
  });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError(400, "Refresh token is required");
  }

  const user = await UserModel.findById(getUserIdFromRefreshToken(refreshToken));

  if (!user) {
    throw new AppError(401, "User not found");
  }

  res.json({ tokens: issueTokens(user) });
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  res.json({
    id: req.user.id,
    email: req.user.email,
    displayName: req.user.displayName,
    accountBalance: req.user.accountBalance,
    peakEquity: req.user.peakEquity,
    killSwitchEnabled: req.user.killSwitchEnabled
  });
}
