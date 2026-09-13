import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { UserDocument } from "../models/user.model";

export function issueTokens(user: UserDocument) {
  return {
    accessToken: signAccessToken(user.id, user.email),
    refreshToken: signRefreshToken(user.id)
  };
}

export function getUserIdFromRefreshToken(token: string): string {
  return verifyRefreshToken(token).sub;
}
