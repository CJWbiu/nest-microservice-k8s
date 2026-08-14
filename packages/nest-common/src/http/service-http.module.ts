import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ServiceHttpClient } from './service-http.client';

@Module({
  imports: [HttpModule],
  providers: [ServiceHttpClient],
  exports: [ServiceHttpClient, HttpModule],
})
export class ServiceHttpModule {}
