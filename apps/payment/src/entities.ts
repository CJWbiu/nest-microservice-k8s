import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';
import { PaymentState } from '@bookstore/shared';

@Entity('payment')
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'pay_id', length: 100 })
  payId: string;

  @Column({ name: 'create_time', type: 'timestamptz' })
  createTime: Date;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'bigint' })
  expires: number;

  @Column({ name: 'payment_link', length: 300 })
  paymentLink: string;

  @Column({ name: 'pay_state', length: 20 })
  payState: PaymentState;
}

@Entity('wallet')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  money: number;

  @Column({ name: 'account_id' })
  accountId: number;
}
