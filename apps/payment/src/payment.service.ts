import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  DEFAULT_PAYMENT_EXPIRES_MS,
  PaymentState,
  SHIPPING_FEE,
  SettlementDto,
} from '@bookstore/shared';
import { PaymentEntity, Wallet } from './entities';
import {
  SettlementWithProducts,
  WarehouseClient,
} from './warehouse.client';

@Injectable()
export class PaymentService implements OnModuleInit {
  private readonly logger = new Logger(PaymentService.name);
  private readonly settlementCache = new Map<string, SettlementWithProducts>();

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    private readonly warehouse: WarehouseClient,
  ) {}

  async onModuleInit() {
    if ((await this.walletRepo.count()) === 0) {
      await this.walletRepo.save(
        this.walletRepo.create({ id: 1, money: 300, accountId: 1 }),
      );
      await this.walletRepo.query(
        `SELECT setval(pg_get_serial_sequence('wallet', 'id'), (SELECT MAX(id) FROM wallet))`,
      );
    }
  }

  async executeBySettlement(
    bill: SettlementDto,
    accountId?: number,
  ): Promise<PaymentEntity> {
    const enriched = await this.warehouse.replenishProductInformation(bill);
    const payment = await this.producePayment(enriched, accountId);
    this.setupAutoThawedTrigger(payment);
    return payment;
  }

  private async producePayment(
    bill: SettlementWithProducts,
    accountId?: number,
  ): Promise<PaymentEntity> {
    let total = SHIPPING_FEE;
    for (const item of bill.items) {
      await this.warehouse.frozen(item.id, item.amount);
      const product = bill.productMap[item.id];
      total += Number(product.price) * item.amount;
    }

    const payId = uuidv4();
    const payment = this.paymentRepo.create({
      payId,
      createTime: new Date(),
      totalPrice: total,
      expires: DEFAULT_PAYMENT_EXPIRES_MS,
      payState: PaymentState.WAITING,
      paymentLink: accountId
        ? `/restful/pay/modify/${payId}?state=PAYED&accountId=${accountId}`
        : `/restful/pay/modify/${payId}?state=PAYED`,
    });
    const saved = await this.paymentRepo.save(payment);
    this.settlementCache.set(payId, bill);
    this.logger.log(`Created payment ${payId}, total=${total}`);
    return saved;
  }

  async accomplishPayment(accountId: number, payId: string) {
    const price = await this.accomplish(payId);
    try {
      await this.decreaseWallet(accountId, price);
    } catch (e) {
      await this.rollbackSettlement(PaymentState.PAYED, payId);
      throw e;
    }
    this.settlementCache.delete(payId);
  }

  async cancelPayment(payId: string) {
    await this.cancel(payId);
    this.settlementCache.delete(payId);
  }

  private async accomplish(payId: string): Promise<number> {
    const payment = await this.getByPayId(payId);
    if (payment.payState !== PaymentState.WAITING) {
      throw new BadRequestException(
        `当前订单不允许支付，当前状态为：${payment.payState}`,
      );
    }
    payment.payState = PaymentState.PAYED;
    await this.paymentRepo.save(payment);
    await this.accomplishSettlement(PaymentState.PAYED, payId);
    return Number(payment.totalPrice);
  }

  private async cancel(payId: string) {
    const payment = await this.getByPayId(payId);
    if (payment.payState !== PaymentState.WAITING) {
      throw new BadRequestException(
        `当前订单不允许取消，当前状态为：${payment.payState}`,
      );
    }
    payment.payState = PaymentState.CANCEL;
    await this.paymentRepo.save(payment);
    await this.accomplishSettlement(PaymentState.CANCEL, payId);
  }

  private setupAutoThawedTrigger(payment: PaymentEntity) {
    setTimeout(async () => {
      try {
        const current = await this.paymentRepo.findOne({
          where: { id: payment.id },
        });
        if (current && current.payState === PaymentState.WAITING) {
          this.logger.log(`Payment ${payment.payId} TIMEOUT`);
          current.payState = PaymentState.TIMEOUT;
          await this.paymentRepo.save(current);
          await this.accomplishSettlement(PaymentState.TIMEOUT, payment.payId);
          this.settlementCache.delete(payment.payId);
        }
      } catch (e) {
        this.logger.error(`Auto thaw failed for ${payment.payId}`, e as Error);
      }
    }, Number(payment.expires));
  }

  private async accomplishSettlement(endState: PaymentState, payId: string) {
    const settlement = this.settlementCache.get(payId);
    if (!settlement) {
      this.logger.warn(`No settlement cache for ${payId}`);
      return;
    }
    for (const item of settlement.items) {
      if (endState === PaymentState.PAYED) {
        await this.warehouse.decrease(item.id, item.amount);
      } else {
        await this.warehouse.thawed(item.id, item.amount);
      }
    }
  }

  private async rollbackSettlement(endState: PaymentState, payId: string) {
    const settlement = this.settlementCache.get(payId);
    if (!settlement) return;
    for (const item of settlement.items) {
      if (endState === PaymentState.PAYED) {
        await this.warehouse.increase(item.id, item.amount);
      } else {
        await this.warehouse.frozen(item.id, item.amount);
      }
    }
  }

  private async decreaseWallet(accountId: number, amount: number) {
    let wallet = await this.walletRepo.findOne({ where: { accountId } });
    if (!wallet) {
      wallet = await this.walletRepo.save(
        this.walletRepo.create({ accountId, money: 0 }),
      );
    }
    if (Number(wallet.money) <= amount) {
      throw new BadRequestException('用户余额不足以支付，请先充值');
    }
    wallet.money = Number(wallet.money) - amount;
    await this.walletRepo.save(wallet);
    this.logger.log(
      `Wallet decreased. balance=${wallet.money}, spent=${amount}`,
    );
  }

  private async getByPayId(payId: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepo.findOne({ where: { payId } });
    if (!payment) throw new NotFoundException(`Payment ${payId} not found`);
    return payment;
  }
}
