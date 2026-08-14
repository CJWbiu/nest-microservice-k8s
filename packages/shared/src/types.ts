export interface AccountDto {
  id?: number;
  username: string;
  password?: string;
  name: string;
  avatar?: string;
  telephone?: string;
  email?: string;
  location?: string;
}

export interface SpecificationDto {
  id?: number;
  item: string;
  value: string;
  productId?: number;
}

export interface ProductDto {
  id?: number;
  title: string;
  price: number;
  rate?: number;
  description?: string;
  cover?: string;
  detail?: string;
  specifications?: SpecificationDto[];
}

export interface StockpileDto {
  id?: number;
  amount: number;
  frozen: number;
  productId?: number;
}

export interface AdvertisementDto {
  id?: number;
  image: string;
  productId: number;
}

export interface SettlementItem {
  amount: number;
  id: number; // productId (JSON field name matches original frontend)
}

export interface PurchaseDto {
  delivery?: boolean;
  pay: string;
  name: string;
  telephone: string;
  location: string;
}

export interface SettlementDto {
  items: SettlementItem[];
  purchase: PurchaseDto;
}

export enum PaymentState {
  WAITING = 'WAITING',
  CANCEL = 'CANCEL',
  PAYED = 'PAYED',
  TIMEOUT = 'TIMEOUT',
  NOT_SUPPORT = 'NOT_SUPPORT',
}

export interface PaymentDto {
  id?: number;
  payId: string;
  createTime: string | Date;
  totalPrice: number;
  expires: number;
  paymentLink: string;
  payState: PaymentState;
}

export enum DeliveredStatus {
  DECREASE = 'DECREASE',
  INCREASE = 'INCREASE',
  FROZEN = 'FROZEN',
  THAWED = 'THAWED',
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  username?: string;
  authorities?: string[];
}

export interface JwtPayload {
  sub?: string;
  user_name?: string;
  username?: string;
  client_id?: string;
  scope?: string[] | string;
  authorities?: string[];
  accountId?: number;
  exp?: number;
  iat?: number;
}
