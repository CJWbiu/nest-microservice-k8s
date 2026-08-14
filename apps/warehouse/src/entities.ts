import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  title: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('float', { nullable: true, default: 0 })
  rate: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 200, nullable: true })
  cover: string;

  @Column({ length: 200, nullable: true })
  detail: string;

  @OneToMany(() => Specification, (s) => s.product, {
    cascade: true,
    eager: true,
  })
  specifications: Specification[];
}

@Entity('specification')
export class Specification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  item: string;

  @Column({ length: 100 })
  value: string;

  @ManyToOne(() => Product, (p) => p.specifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  productId: number;
}

@Entity('stockpile')
export class Stockpile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  amount: number;

  @Column({ default: 0 })
  frozen: number;

  @OneToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  productId: number;

  frozenStock(number: number) {
    this.amount -= number;
    this.frozen += number;
  }

  thawed(number: number) {
    this.frozenStock(-1 * number);
  }

  decrease(number: number) {
    this.frozen -= number;
  }

  /** Align with Java demo: rollback of DECREASE restores frozen qty */
  increase(number: number) {
    this.frozen += number;
  }
}

@Entity('advertisement')
export class Advertisement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  image: string;

  @Column({ name: 'product_id' })
  productId: number;
}
