import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('account')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ length: 50 })
  username: string;

  @Exclude({ toPlainOnly: true })
  @Column({ length: 100, select: true })
  password: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, nullable: true, default: '' })
  avatar: string;

  @Index({ unique: true })
  @Column({ length: 20, nullable: true })
  telephone: string;

  @Index({ unique: true })
  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 100, nullable: true })
  location: string;
}
