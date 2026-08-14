import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function postgresOptions(
  config: ConfigService,
  database: string,
  entities: TypeOrmModuleOptions['entities'],
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST') ?? 'localhost',
    port: Number(config.get<string>('DB_PORT') ?? 5432),
    username: config.get<string>('DB_USER') ?? 'bookstore',
    password: config.get<string>('DB_PASSWORD') ?? 'bookstore',
    database: config.get<string>('DB_NAME') ?? database,
    entities,
    synchronize: true,
  };
}
