import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { JWT_SIGNING_KEY } from '@bookstore/shared';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';
import { AccountClient } from './account.client';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    JwtModule.register({
      secret: process.env.JWT_SIGNING_KEY || JWT_SIGNING_KEY,
    }),
  ],
  controllers: [OauthController],
  providers: [OauthService, AccountClient],
})
export class AppModule {}
