import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request, Response } from "express";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { TokenService } from "@/lib/utils/jwt.util";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const accessToken = req.cookies["accessToken"];
    const refreshToken = req.cookies["refreshToken"];

    try {
      if (!accessToken) throw new UnauthorizedException();
      const decoded = await this.tokenService.verifyToken(
        accessToken,
        "access"
      );
      if (!decoded) throw new Error("Invalid or expire Access Token");
      this.tokenService.attachDecodedUser(req, decoded);
      return true;
    } catch (err) {
      if (!refreshToken) throw new UnauthorizedException();

      try {
        const decoded = await this.tokenService.verifyToken(
          refreshToken,
          "refresh"
        );
        if (!decoded) throw new Error("Invalid or expire Access Token");
        await this.tokenService.refreshTokens(req, res, decoded);

        if (!req["user"]) throw new UnauthorizedException("User not found");
        if (!req["user"]?.isAuth)
          throw new UnauthorizedException("User not authorized.");

        return true;
      } catch {
        throw new UnauthorizedException("Invalid refresh token");
      }
    }
  }
}
