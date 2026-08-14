import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  GrantType,
  OAuthClients,
  OAuthTokenResponse,
  Role,
} from '@bookstore/shared';
import { AccountClient } from './account.client';

interface ClientDef {
  clientId: string;
  clientSecret: string;
  grantTypes: readonly string[];
  scopes: readonly string[];
}

const CLIENTS: ClientDef[] = Object.values(OAuthClients);

@Injectable()
export class OauthService {
  private readonly refreshTokens = new Map<
    string,
    { username: string; accountId: number; authorities: string[]; expiresAt: number }
  >();

  constructor(
    private readonly jwt: JwtService,
    private readonly accountClient: AccountClient,
  ) {}

  private findClient(clientId: string, clientSecret: string): ClientDef {
    const client = CLIENTS.find((c) => c.clientId === clientId);
    if (!client || client.clientSecret !== clientSecret) {
      throw new UnauthorizedException('Invalid client credentials');
    }
    return client;
  }

  /** Mint a SERVICE-scope token without HTTP (used to call account) */
  mintServiceToken(clientId = OAuthClients.security.clientId): string {
    const client = CLIENTS.find((c) => c.clientId === clientId)!;
    return this.jwt.sign(
      {
        client_id: client.clientId,
        scope: [...client.scopes],
        authorities: [],
      },
      { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    );
  }

  async issueToken(params: Record<string, string>): Promise<OAuthTokenResponse> {
    const grantType = params.grant_type;
    const clientId = params.client_id;
    const clientSecret = params.client_secret;
    if (!grantType || !clientId || !clientSecret) {
      throw new BadRequestException('Missing grant_type / client_id / client_secret');
    }
    const client = this.findClient(clientId, clientSecret);
    if (!client.grantTypes.includes(grantType)) {
      throw new BadRequestException(`Unsupported grant_type for client: ${grantType}`);
    }

    if (grantType === GrantType.CLIENT_CREDENTIALS) {
      return this.tokenResponse({
        clientId: client.clientId,
        scopes: [...client.scopes],
      });
    }

    if (grantType === GrantType.PASSWORD) {
      const username = params.username;
      const password = params.password;
      if (!username || !password) {
        throw new BadRequestException('Missing username / password');
      }
      const serviceToken = this.mintServiceToken();
      const account = await this.accountClient.fetchAccount(username, serviceToken);
      if (!account?.password || !(await bcrypt.compare(password, account.password))) {
        throw new UnauthorizedException('Bad credentials');
      }
      const authorities: string[] = [Role.USER];
      if (account.id === 1) {
        authorities.push(Role.ADMIN);
      }
      return this.tokenResponse({
        clientId: client.clientId,
        scopes: [...client.scopes],
        username: account.username,
        accountId: account.id,
        authorities,
        includeRefresh: true,
      });
    }

    if (grantType === GrantType.REFRESH_TOKEN) {
      const refresh = params.refresh_token;
      if (!refresh) {
        throw new BadRequestException('Missing refresh_token');
      }
      const stored = this.refreshTokens.get(refresh);
      if (!stored || stored.expiresAt < Date.now()) {
        this.refreshTokens.delete(refresh);
        throw new UnauthorizedException('Invalid refresh_token');
      }
      return this.tokenResponse({
        clientId: client.clientId,
        scopes: [...client.scopes],
        username: stored.username,
        accountId: stored.accountId,
        authorities: stored.authorities,
        includeRefresh: true,
      });
    }

    throw new BadRequestException(`Unsupported grant_type: ${grantType}`);
  }

  private tokenResponse(opts: {
    clientId: string;
    scopes: string[];
    username?: string;
    accountId?: number;
    authorities?: string[];
    includeRefresh?: boolean;
  }): OAuthTokenResponse {
    const payload: Record<string, unknown> = {
      client_id: opts.clientId,
      scope: opts.scopes,
      authorities: opts.authorities || [],
    };
    if (opts.username) {
      payload.username = opts.username;
      payload.user_name = opts.username;
      payload.sub = opts.username;
      payload.accountId = opts.accountId;
    }

    const access_token = this.jwt.sign(payload, {
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });

    const response: OAuthTokenResponse = {
      access_token,
      token_type: 'bearer',
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
      scope: opts.scopes.join(' '),
    };

    if (opts.username) {
      response.username = opts.username;
      response.authorities = opts.authorities;
    }

    if (opts.includeRefresh && opts.username && opts.accountId != null) {
      const refresh_token = uuidv4();
      this.refreshTokens.set(refresh_token, {
        username: opts.username,
        accountId: opts.accountId,
        authorities: opts.authorities || [],
        expiresAt: Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000,
      });
      response.refresh_token = refresh_token;
    }

    return response;
  }

  checkToken(token: string) {
    try {
      return this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
