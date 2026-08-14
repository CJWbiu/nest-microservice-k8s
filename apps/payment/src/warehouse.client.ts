import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServiceHttpClient } from '@bookstore/nest-common';
import {
  DeliveredStatus,
  ProductDto,
  SettlementDto,
} from '@bookstore/shared';

export type SettlementWithProducts = SettlementDto & {
  productMap: Record<number, ProductDto>;
};

@Injectable()
export class WarehouseClient {
  private readonly logger = new Logger(WarehouseClient.name);

  constructor(
    private readonly http: ServiceHttpClient,
    private readonly config: ConfigService,
  ) {}

  private base() {
    return this.config.get('WAREHOUSE_URL') || 'http://localhost:8083';
  }

  async replenishProductInformation(
    bill: SettlementDto,
  ): Promise<SettlementWithProducts> {
    const productMap: Record<number, ProductDto> = {};
    for (const item of bill.items) {
      const product = await this.http.get<ProductDto>(
        `${this.base()}/restful/products/${item.id}`,
      );
      productMap[item.id] = product;
    }
    return { ...bill, productMap };
  }

  async frozen(productId: number, amount: number) {
    await this.setDelivered(productId, DeliveredStatus.FROZEN, amount);
  }

  async thawed(productId: number, amount: number) {
    await this.setDelivered(productId, DeliveredStatus.THAWED, amount);
  }

  async decrease(productId: number, amount: number) {
    await this.setDelivered(productId, DeliveredStatus.DECREASE, amount);
  }

  async increase(productId: number, amount: number) {
    await this.setDelivered(productId, DeliveredStatus.INCREASE, amount);
  }

  private async setDelivered(
    productId: number,
    status: DeliveredStatus,
    amount: number,
  ) {
    this.logger.debug(`stockpile delivered product=${productId} status=${status} amount=${amount}`);
    await this.http.patch(
      `${this.base()}/restful/products/stockpile/delivered/${productId}`,
      {},
      { status, amount },
    );
  }
}
