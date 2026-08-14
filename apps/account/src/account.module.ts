import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule implements OnModuleInit {
  constructor(
    @InjectRepository(Account)
    private readonly repo: Repository<Account>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count > 0) return;

    // bcrypt hash for password "123456" (same as Java demo)
    const password =
      '$2a$10$iIim4LtpT2yjxU2YVNDuO.yb1Z2lq86vYBZleAeuIh2aFXjyoMCM.';
    await this.repo.save(
      this.repo.create({
        id: 1,
        username: 'icyfenix',
        password,
        name: '周志明',
        avatar: '',
        telephone: '18888888888',
        email: 'icyfenix@gmail.com',
        location:
          '唐家湾港湾大道科技一路3号远光软件股份有限公司',
      }),
    );

    // Ensure sequence continues after explicit id insert
    await this.repo.query(
      `SELECT setval(pg_get_serial_sequence('account', 'id'), (SELECT MAX(id) FROM account))`,
    );
  }
}
