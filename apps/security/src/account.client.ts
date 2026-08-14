import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AccountDto } from '@bookstore/shared';

@Injectable()
export class AccountClient {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async fetchAccount(
    username: string,
    accessToken: string,
  ): Promise<AccountDto & { password?: string }> {
    const accountUrl =
      this.config.get<string>('ACCOUNT_URL') || 'http://localhost:8082';
    const { data } = await firstValueFrom(
      this.http.get<AccountDto & { password?: string }>(
        `${accountUrl}/restful/accounts/${encodeURIComponent(username)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      ),
    );
    return data;
  }
}
