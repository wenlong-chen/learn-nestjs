import { Controller, Request, Post, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "../../domain/auth/local-auth.guard";
import { AuthService } from "../../domain/auth/auth.service";

@Controller()
export class AuthController {
  constructor() {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login() {
    return {"status": "success"}
  }


}
