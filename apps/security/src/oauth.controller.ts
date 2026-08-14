import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OauthService } from './oauth.service';

@Controller('oauth')
export class OauthController {
  constructor(private readonly oauth: OauthService) {}

  /**
   * OAuth2 token endpoint — supports form body and query (same as Spring demo).
   * POST /oauth/token
   */
  @Post('token')
  async token(@Body() body: Record<string, string>, @Query() query: Record<string, string>) {
    const params = { ...query, ...body };
    return this.oauth.issueToken(params);
  }

  @Get('token')
  async tokenGet(@Query() query: Record<string, string>) {
    return this.oauth.issueToken(query);
  }

  @Get('check_token')
  @Post('check_token')
  checkToken(@Query('token') token: string, @Body('token') bodyToken: string) {
    return this.oauth.checkToken(token || bodyToken);
  }

  @Get('token_key')
  tokenKey() {
    return { alg: 'HS256', value: 'symmetric' };
  }
}
