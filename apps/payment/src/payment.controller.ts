import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, AuthUser, Public, Roles, Scopes } from '@bookstore/nest-common';
import { PaymentState, Role, Scope } from '@bookstore/shared';
import { PaymentService } from './payment.service';
import { CreateSettlementDto } from './payment.dto';

@Controller('restful/settlements')
export class SettlementController {
  constructor(private readonly service: PaymentService) {}

  @Post()
  @Roles(Role.USER)
  @Scopes(Scope.BROWSER)
  create(@Body() dto: CreateSettlementDto, @CurrentUser() user: AuthUser) {
    return this.service.executeBySettlement(dto, user.accountId);
  }
}

@Controller('restful/pay')
export class PayController {
  constructor(private readonly service: PaymentService) {}

  @Patch(':payId')
  @Roles(Role.USER)
  @Scopes(Scope.BROWSER)
  async updateState(
    @Param('payId') payId: string,
    @Query('state') state: PaymentState,
    @CurrentUser() user: AuthUser,
  ) {
    if (state === PaymentState.PAYED) {
      await this.service.accomplishPayment(user.accountId!, payId);
    } else {
      await this.service.cancelPayment(payId);
    }
    return { code: 0 };
  }

  @Get('modify/:payId')
  @Public()
  async updateStateAlias(
    @Param('payId') payId: string,
    @Query('accountId') accountId: string,
    @Query('state') state: PaymentState,
  ) {
    if (state === PaymentState.PAYED) {
      await this.service.accomplishPayment(Number(accountId), payId);
    } else {
      await this.service.cancelPayment(payId);
    }
    return { code: 0 };
  }
}
