import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, ServiceHttpModule, postgresOptions } from '@bookstore/nest-common';
import { PaymentEntity, Wallet } from './entities';
import { PaymentService } from './payment.service';
import { SettlementController, PayController } from './payment.controller';
import { WarehouseClient } from './warehouse.client';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ServiceHttpModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        postgresOptions(config, 'payment', [PaymentEntity, Wallet]),
    }),
    TypeOrmModule.forFeature([PaymentEntity, Wallet]),
  ],
  controllers: [SettlementController, PayController],
  providers: [PaymentService, WarehouseClient],
})
export class AppModule {}
