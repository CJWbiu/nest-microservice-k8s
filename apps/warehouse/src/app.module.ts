import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, postgresOptions } from '@bookstore/nest-common';
import { Product, Specification, Stockpile, Advertisement } from './entities';
import { WarehouseModule } from './warehouse.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        postgresOptions(config, 'warehouse', [
          Product,
          Specification,
          Stockpile,
          Advertisement,
        ]),
    }),
    WarehouseModule,
  ],
})
export class AppModule {}
