import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { PRODUCT_CACHE_TTL_MS } from '@bookstore/shared';
import { Product, Specification, Stockpile, Advertisement } from './entities';
import { ProductService } from './product.service';
import { ProductController, AdvertisementController } from './product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Specification, Stockpile, Advertisement]),
    CacheModule.register({ ttl: PRODUCT_CACHE_TTL_MS }),
  ],
  controllers: [ProductController, AdvertisementController],
  providers: [ProductService],
})
export class WarehouseModule implements OnModuleInit {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Stockpile) private readonly stockRepo: Repository<Stockpile>,
    @InjectRepository(Advertisement) private readonly adRepo: Repository<Advertisement>,
    @InjectRepository(Specification) private readonly specRepo: Repository<Specification>,
  ) {}

  async onModuleInit() {
    if ((await this.productRepo.count()) > 0) return;

    const books = [
      {
        id: 1,
        title: '深入理解Java虚拟机（第3版）',
        price: 129,
        rate: 9.6,
        description: '从工作原理和工程实践两个维度深入剖析JVM的经典著作。',
        cover: 'https://picsum.photos/seed/jvm3/300/400',
        detail: 'https://picsum.photos/seed/jvm3d/800/400',
        author: '周志明',
      },
      {
        id: 2,
        title: '智慧的疆界',
        price: 69,
        rate: 9.1,
        description: '从图灵机到人工智能，全面读懂人工智能。',
        cover: 'https://picsum.photos/seed/ai/300/400',
        detail: 'https://picsum.photos/seed/aid/800/400',
        author: '周志明',
      },
      {
        id: 3,
        title: 'Java虚拟机规范（Java SE 8）',
        price: 79,
        rate: 7.7,
        description: '完整而准确地阐释Java虚拟机各方面细节。',
        cover: 'https://picsum.photos/seed/jvms8/300/400',
        detail: '',
        author: 'Tim Lindholm',
      },
      {
        id: 4,
        title: '深入理解Java虚拟机（第2版）',
        price: 79,
        rate: 9.0,
        description: 'JVM高级特性与最佳实践（第2版）。',
        cover: 'https://picsum.photos/seed/jvm2/300/400',
        detail: 'https://picsum.photos/seed/jvm2d/800/400',
        author: '周志明',
      },
      {
        id: 5,
        title: 'Java虚拟机规范（Java SE 7）',
        price: 69,
        rate: 8.9,
        description: '整合自1999年以来Java世界的技术变化。',
        cover: 'https://picsum.photos/seed/jvms7/300/400',
        detail: '',
        author: 'Tim Lindholm',
      },
      {
        id: 6,
        title: '深入理解OSGi',
        price: 79,
        rate: 7.7,
        description: '基于最新OSGi R5.0规范的著作。',
        cover: 'https://picsum.photos/seed/osgi/300/400',
        detail: 'https://picsum.photos/seed/osgid/800/400',
        author: '周志明 / 谢小明',
      },
      {
        id: 7,
        title: '深入理解Java虚拟机',
        price: 69,
        rate: 8.6,
        description: '第一版：从核心理论和实际运用探讨Java虚拟机。',
        cover: 'https://picsum.photos/seed/jvm1/300/400',
        detail: '',
        author: '周志明',
      },
      {
        id: 8,
        title: '凤凰架构：构建可靠的大型分布式系统',
        price: 0,
        rate: 0,
        description: '以如何构建可靠分布式大型软件系统为叙事主线的开源文档。',
        cover: 'https://picsum.photos/seed/fenix/300/400',
        detail: 'https://picsum.photos/seed/fenixd/800/400',
        author: '周志明',
      },
    ];

    for (const b of books) {
      const product = await this.productRepo.save(
        this.productRepo.create({
          id: b.id,
          title: b.title,
          price: b.price,
          rate: b.rate,
          description: b.description,
          cover: b.cover,
          detail: b.detail,
        }),
      );
      await this.specRepo.save(
        this.specRepo.create({
          item: '作者',
          value: b.author,
          productId: product.id,
        }),
      );
      await this.stockRepo.save(
        this.stockRepo.create({
          id: b.id,
          amount: 30,
          frozen: 0,
          productId: product.id,
        }),
      );
    }

    await this.adRepo.save([
      this.adRepo.create({ id: 1, image: 'https://picsum.photos/seed/carousel1/1200/400', productId: 8 }),
      this.adRepo.create({ id: 2, image: 'https://picsum.photos/seed/carousel2/1200/400', productId: 2 }),
      this.adRepo.create({ id: 3, image: 'https://picsum.photos/seed/carousel3/1200/400', productId: 1 }),
    ]);

    for (const table of ['product', 'specification', 'stockpile', 'advertisement']) {
      await this.productRepo.query(
        `SELECT setval(pg_get_serial_sequence('${table}', 'id'), (SELECT COALESCE(MAX(id),1) FROM ${table}))`,
      );
    }
  }
}
