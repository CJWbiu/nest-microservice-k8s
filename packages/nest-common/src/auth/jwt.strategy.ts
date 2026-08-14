import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JWT_SIGNING_KEY, JwtPayload } from '@bookstore/shared';
import { AuthUser } from './current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SIGNING_KEY') || JWT_SIGNING_KEY,
    });
  }

  validate(payload: JwtPayload): AuthUser {
    const scopes = Array.isArray(payload.scope)
      ? payload.scope
      : typeof payload.scope === 'string'
        ? payload.scope.split(' ').filter(Boolean)
        : [];
    return {
      username: payload.username || payload.user_name || payload.sub,
      accountId: payload.accountId,
      clientId: payload.client_id,
      scopes,
      authorities: payload.authorities || [],
      payload,
    };
  }
}
