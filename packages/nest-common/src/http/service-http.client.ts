import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OAuthTokenResponse } from '@bookstore/shared';

@Injectable()
export class ServiceHttpClient {
  private readonly logger = new Logger(ServiceHttpClient.name);
  private cachedToken?: { value: string; expiresAt: number };

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now + 30_000) {
      return this.cachedToken.value;
    }

    const securityUrl =
      this.config.get<string>('SECURITY_URL') || 'http://localhost:8081';
    const clientId = this.config.get<string>('OAUTH_CLIENT_ID') || 'payment';
    const clientSecret =
      this.config.get<string>('OAUTH_CLIENT_SECRET') || 'payment_secret';

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    });

    const { data } = await firstValueFrom(
      this.http.post<OAuthTokenResponse>(
        `${securityUrl}/oauth/token`,
        body.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      ),
    );

    this.cachedToken = {
      value: data.access_token,
      expiresAt: now + (data.expires_in || 3600) * 1000,
    };
    this.logger.debug(`Fetched client_credentials token for ${clientId}`);
    return data.access_token;
  }

  async get<T = unknown>(url: string): Promise<T> {
    const token = await this.getAccessToken();
    const { data } = await firstValueFrom(
      this.http.get<T>(url, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    return data;
  }

  async patch<T = unknown>(
    url: string,
    body?: unknown,
    params?: Record<string, string | number>,
  ): Promise<T> {
    const token = await this.getAccessToken();
    const { data } = await firstValueFrom(
      this.http.patch<T>(url, body ?? {}, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      }),
    );
    return data;
  }

  async post<T = unknown>(url: string, body?: unknown): Promise<T> {
    const token = await this.getAccessToken();
    const { data } = await firstValueFrom(
      this.http.post<T>(url, body ?? {}, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    return data;
  }
}
