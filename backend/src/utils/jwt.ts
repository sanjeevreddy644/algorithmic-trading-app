import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
}

export function signAccessToken(userId: string, email: string): string {
  return jwt.sign(
    {
      sub: userId,
      email,
      type: "access"
    },
    env.jwtAccessSecret,
    {
      expiresIn: env.jwtAccessExpiresIn
    } as jwt.SignOptions
  );
}

export function signRefreshToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
      type: "refresh"
    },
    env.jwtRefreshSecret,
    {
      expiresIn: env.jwtRefreshExpiresIn
    } as jwt.SignOptions
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
}
