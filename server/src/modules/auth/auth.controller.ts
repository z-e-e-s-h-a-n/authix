import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDto, SignUpDto } from "@/common/dto";
import type { Request, Response } from "express";
import { Public } from "@/common/decorators";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("signup")
  async signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post("signin")
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    return this.authService.signIn(dto, req, res);
  }

  @Post("signout")
  async signOut(@Res({ passthrough: true }) res: Response) {
    return this.authService.signOut(res);
  }
}
