import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT || 8081);
  await app.listen(port);
  console.log(`security service listening on ${port}`);
}
bootstrap();
