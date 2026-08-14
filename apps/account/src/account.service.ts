import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Account } from './account.entity';
import { CreateAccountDto, UpdateAccountDto } from './account.dto';
import { AuthUser } from '@bookstore/nest-common';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly repo: Repository<Account>,
  ) {}

  async findByUsername(username: string): Promise<Account> {
    const account = await this.repo.findOne({ where: { username } });
    if (!account) {
      throw new NotFoundException(`Account ${username} not found`);
    }
    return account;
  }

  /** Internal: includes password for auth verification */
  async findByUsernameWithPassword(username: string): Promise<Account | null> {
    return this.repo
      .createQueryBuilder('a')
      .addSelect('a.password')
      .where('a.username = :username', { username })
      .getOne();
  }

  async create(dto: CreateAccountDto): Promise<Account> {
    const exists = await this.repo.findOne({
      where: [
        { username: dto.username },
        ...(dto.email ? [{ email: dto.email }] : []),
        ...(dto.telephone ? [{ telephone: dto.telephone }] : []),
      ],
    });
    if (exists) {
      throw new ConflictException('Account already exists');
    }
    const account = this.repo.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 10),
      avatar: dto.avatar || '',
    });
    return this.repo.save(account);
  }

  async update(dto: UpdateAccountDto, user: AuthUser): Promise<Account> {
    if (user.username !== dto.username && !user.authorities.includes('ROLE_ADMIN')) {
      throw new ForbiddenException('Cannot update another user');
    }
    const account = await this.findByUsername(dto.username);
    if (dto.name !== undefined) account.name = dto.name;
    if (dto.avatar !== undefined) account.avatar = dto.avatar;
    if (dto.telephone !== undefined) account.telephone = dto.telephone;
    if (dto.email !== undefined) account.email = dto.email;
    if (dto.location !== undefined) account.location = dto.location;
    // password is not updated via this endpoint (same as original)
    return this.repo.save(account);
  }

  toPublic(account: Account) {
    const { password: _, ...rest } = account;
    return rest;
  }
}
