import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { DeliveredStatus } from '@bookstore/shared';
import { Product, Stockpile, Advertisement } from './entities';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Stockpile) private readonly stockRepo: Repository<Stockpile>,
    @InjectRepository(Advertisement) private readonly adRepo: Repository<Advertisement>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async findAll(): Promise<Product[]> {
    const cached = await this.cache.get<Product[]>('products:all');
    if (cached) return cached;
    const products = await this.productRepo.find();
    await this.cache.set('products:all', products);
    return products;
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async create(data: Partial<Product>): Promise<Product> {
    const product = await this.productRepo.save(this.productRepo.create(data));
    await this.cache.del('products:all');
    return product;
  }

  async update(id: number, data: Partial<Product>): Promise<Product> {
    const product = await this.findById(id);
    Object.assign(product, data);
    const saved = await this.productRepo.save(product);
    await this.cache.del('products:all');
    return saved;
  }

  async remove(id: number): Promise<void> {
    await this.productRepo.delete(id);
    await this.cache.del('products:all');
  }

  async getStockpile(productId: number): Promise<Stockpile> {
    // Align with Java demo: stockpile.id == productId in seed data
    const stock =
      (await this.stockRepo.findOne({ where: { productId } })) ||
      (await this.stockRepo.findOne({ where: { id: productId } }));
    if (!stock) throw new NotFoundException(`Stockpile for product ${productId} not found`);
    return stock;
  }

  async setStockpileAmount(productId: number, amount: number): Promise<void> {
    const stock = await this.getStockpile(productId);
    stock.amount = amount;
    await this.stockRepo.save(stock);
  }

  async setDeliveredStatus(
    productId: number,
    status: DeliveredStatus,
    amount: number,
  ): Promise<void> {
    const stock = await this.getStockpile(productId);
    switch (status) {
      case DeliveredStatus.DECREASE:
        stock.decrease(amount);
        break;
      case DeliveredStatus.INCREASE:
        stock.increase(amount);
        break;
      case DeliveredStatus.FROZEN:
        stock.frozenStock(amount);
        break;
      case DeliveredStatus.THAWED:
        stock.thawed(amount);
        break;
    }
    await this.stockRepo.save(stock);
  }

  async listAds(): Promise<Advertisement[]> {
    return this.adRepo.find();
  }
}
