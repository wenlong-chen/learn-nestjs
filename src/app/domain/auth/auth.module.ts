import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../user/user.module";
import { AuthController } from "../../application/auth/auth.controller";
import { LocalStrategy } from "./local.strategy";
import { jwtConstants } from "./constants";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
