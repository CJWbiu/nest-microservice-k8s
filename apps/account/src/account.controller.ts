import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  CurrentUser,
  AuthUser,
  Public,
  Scopes,
} from '@bookstore/nest-common';
import { Scope } from '@bookstore/shared';
import { AccountService } from './account.service';
import { CreateAccountDto, UpdateAccountDto } from './account.dto';

@Controller('restful/accounts')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  @Get(':username')
  @Scopes(Scope.SERVICE, Scope.BROWSER)
  async getUser(
    @Param('username') username: string,
    @CurrentUser() user: AuthUser,
  ) {
    // SERVICE scope (security) needs password for credential check — same as Java demo
    if (user.scopes.includes(Scope.SERVICE)) {
      const withPwd = await this.service.findByUsernameWithPassword(username);
      if (!withPwd) {
        const account = await this.service.findByUsername(username);
        return account;
      }
      return withPwd;
    }
    const account = await this.service.findByUsername(username);
    return this.service.toPublic(account);
  }

  @Post()
  @Public()
  async createUser(@Body() dto: CreateAccountDto) {
    const account = await this.service.create(dto);
    return this.service.toPublic(account);
  }

  @Put()
  @Scopes(Scope.BROWSER)
  async updateUser(
    @Body() dto: UpdateAccountDto,
    @CurrentUser() user: AuthUser,
  ) {
    const account = await this.service.update(dto, user);
    return this.service.toPublic(account);
  }
}
