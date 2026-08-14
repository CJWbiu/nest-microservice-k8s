import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Public, Roles, Scopes } from '@bookstore/nest-common';
import { DeliveredStatus, Role, Scope } from '@bookstore/shared';
import { ProductService } from './product.service';
import { Product } from './entities';

@Controller('restful/products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get()
  @Public()
  findAll() {
    return this.service.findAll();
  }

  // Stockpile routes must be registered before :id
  @Get('stockpile/:productId')
  @Roles(Role.ADMIN)
  @Scopes(Scope.BROWSER, Scope.SERVICE)
  getStock(@Param('productId', ParseIntPipe) productId: number) {
    return this.service.getStockpile(productId);
  }

  @Patch('stockpile/delivered/:productId')
  @Scopes(Scope.SERVICE)
  async delivered(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('status') status: DeliveredStatus,
    @Query('amount', ParseIntPipe) amount: number,
  ) {
    await this.service.setDeliveredStatus(productId, status, amount);
    return { code: 0 };
  }

  @Patch('stockpile/:productId')
  @Roles(Role.ADMIN)
  @Scopes(Scope.BROWSER)
  async setStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('amount', ParseIntPipe) amount: number,
  ) {
    await this.service.setStockpileAmount(productId, amount);
    return { code: 0 };
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @Scopes(Scope.BROWSER)
  create(@Body() body: Partial<Product>) {
    return this.service.create(body);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @Scopes(Scope.BROWSER)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<Product>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @Scopes(Scope.BROWSER)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { code: 0 };
  }
}

@Controller('restful/advertisements')
export class AdvertisementController {
  constructor(private readonly service: ProductService) {}

  @Get()
  @Public()
  list() {
    return this.service.listAds();
  }
}
