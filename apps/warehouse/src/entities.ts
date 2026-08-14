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
  /** 商品主键（自增） */
  @PrimaryGeneratedColumn()
  id: number;

  /** 商品标题（书名） */
  @Column({ length: 50 })
  title: string;

  /** 售价（decimal(10,2)，保留两位小数） */
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  /** 评分（0~10 的浮点数，可空，默认 0） */
  @Column('float', { nullable: true, default: 0 })
  rate: number;

  /** 商品简介/描述 */
  @Column({ type: 'text', nullable: true })
  description: string;

  /** 封面图 URL */
  @Column({ length: 200, nullable: true })
  cover: string;

  /** 详情大图 URL */
  @Column({ length: 200, nullable: true })
  detail: string;

  /** 规格参数列表：一个商品对应多条规格（一对多），查询时急加载、保存时级联 */
  @OneToMany(() => Specification, (s) => s.product, {
    cascade: true,
    eager: true,
  })
  specifications: Specification[];
}

@Entity('specification')
export class Specification {
  /** 规格主键（自增） */
  @PrimaryGeneratedColumn()
  id: number;

  /** 参数名，如「作者」「出版社」 */
  @Column({ length: 50 })
  item: string;

  /** 参数值，如「周志明」「机械工业出版社」 */
  @Column({ length: 100 })
  value: string;

  /** 所属商品（多对一，删除商品时级联删除其规格） */
  @ManyToOne(() => Product, (p) => p.specifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  /** 所属商品 ID（外键列 product_id） */
  @Column({ name: 'product_id' })
  productId: number;
}

@Entity('stockpile')
export class Stockpile {
  /** 库存主键（自增） */
  @PrimaryGeneratedColumn()
  id: number;

  /** 可售库存数量（默认 0） */
  @Column({ default: 0 })
  amount: number;

  /** 冻结库存数量：下单锁定、尚未发货的部分（默认 0） */
  @Column({ default: 0 })
  frozen: number;

  /** 关联的商品（一对一） */
  @OneToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  /** 关联的商品 ID（外键列 product_id） */
  @Column({ name: 'product_id' })
  productId: number;

  /** 冻结库存：把 n 件从可售转入冻结 */
  frozenStock(number: number) {
    this.amount -= number;
    this.frozen += number;
  }

  /** 解冻库存：把 n 件从冻结转回可售（frozenStock 的逆操作） */
  thawed(number: number) {
    this.frozenStock(-1 * number);
  }

  /** 发货扣减：冻结库存实际减少 n 件 */
  decrease(number: number) {
    this.frozen -= number;
  }

  /** 取消订单回补：把冻结库存加回 n 件（与 decrease 相反，对齐 Java 原版语义） */
  increase(number: number) {
    this.frozen += number;
  }
}

@Entity('advertisement')
export class Advertisement {
  /** 广告主键（自增） */
  @PrimaryGeneratedColumn()
  id: number;

  /** 广告图片 URL */
  @Column({ length: 200 })
  image: string;

  /** 点击广告跳转的商品 ID */
  @Column({ name: 'product_id' })
  productId: number;
}
