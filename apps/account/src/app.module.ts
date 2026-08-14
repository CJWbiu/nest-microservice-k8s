import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, postgresOptions } from '@bookstore/nest-common';
import { Account } from './account.entity';
import { AccountModule } from './account.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        postgresOptions(config, 'account', [Account]),
    }),
    AccountModule,
  ],
})
export class AppModule {}
