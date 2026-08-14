import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SettlementItemDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNumber()
  id: number;
}

export class PurchaseDto {
  @IsOptional()
  @IsBoolean()
  delivery?: boolean;

  @IsNotEmpty()
  @IsString()
  pay: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  telephone: string;

  @IsNotEmpty()
  @IsString()
  location: string;
}

export class CreateSettlementDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SettlementItemDto)
  items: SettlementItemDto[];

  @ValidateNested()
  @Type(() => PurchaseDto)
  purchase: PurchaseDto;
}
