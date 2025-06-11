import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { newDate } from "./general.util";
import { envConfig } from "@/config";
import { PrismaService } from "@/modules/prisma/prisma.service";
import type { Request, Response, CookieOptions } from "express";

export interface TokenPayload {
  sub: string;
  roles: string[];
  isAuth: Boolean;
}

interface TokensType {
  accessToken: string;
  refreshToken: string;
  tokenId: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async generateTokens(req: Request, payload: TokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: envConfig.jwt.accessSecret,
        expiresIn: envConfig.jwt.accessExp,
      }),
      this.jwtService.signAsync(payload, {
        secret: envConfig.jwt.refreshSecret,
        expiresIn: envConfig.jwt.refreshExp,
      }),
    ]);

    const tokenId = req.cookies["tokenId"];
    const refreshExp = newDate(envConfig.jwt.refreshExp, true);

    const newToken = await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: {
        token: refreshToken,
        userId: payload.sub,
        ip: req.ip || "Unknown IP",
        userAgent: req.headers["user-agent"] || "Unknown User Agent",
        lastUsed: new Date(),
        blacklisted: false,
        isActive: true,
        expiresAt: refreshExp,
      },
    });

    return { accessToken, refreshToken, tokenId: newToken.id };
  }

  async verifyToken(
    token: string,
    type: "access" | "refresh"
  ): Promise<TokenPayload | null> {
    const secret =
      type === "access"
        ? envConfig.jwt.accessSecret
        : envConfig.jwt.refreshSecret;
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token, { secret });
    } catch (error) {
      return null;
    }
  }

  async refreshTokens(req: Request, res: Response, payload: TokenPayload) {
    const refreshToken = req.cookies["refreshToken"];

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken, blacklisted: false },
    });

    if (!tokenRecord) {
      throw new Error("Invalid or expired refresh token.");
    }

    await this.createAuthSession(req, res, payload);
  }

  async createAuthSession(req: Request, res: Response, payload: TokenPayload) {
    const tokens = await this.generateTokens(req, payload);
    this.setAuthCookies(res, tokens);
    return tokens;
  }

  attachDecodedUser = (req: Request, decoded: TokenPayload) => {
    if (decoded) req["user"] = decoded;
  };

  setAuthCookies(res: Response, tokens: TokensType): void {
    const { accessToken, refreshToken, tokenId } = tokens;
    const accessExp = newDate(envConfig.jwt.accessExp, true);
    const refreshExp = newDate(envConfig.jwt.refreshExp, true);

    this.setCookie(res, "accessToken", accessToken, { expires: accessExp });
    this.setCookie(res, "refreshToken", refreshToken, { expires: refreshExp });
    this.setCookie(res, "tokenId", tokenId, { expires: refreshExp });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("tokenId");
  }

  private setCookie = (
    res: Response,
    key: string,
    value: string,
    options?: CookieOptions
  ) => {
    res.cookie(key, value, {
      httpOnly: true,
      secure: envConfig.env === "production",
      sameSite: "strict",
      path: "/",
      ...options,
    });
  };
}
