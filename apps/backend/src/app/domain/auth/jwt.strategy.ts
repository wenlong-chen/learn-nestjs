import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_COOKIE_NAME, jwtConstants } from './constants';
import type { IncomingMessage } from 'http';
import * as cookie from 'cookie';
import { AuthUser } from './auth-user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: IncomingMessage) => {
          return cookie.parse(req.headers.cookie || '')[AUTH_COOKIE_NAME];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: { sub: number; name: string }): Promise<AuthUser> {
    return { id: payload.sub, name: payload.name };
  }
}
