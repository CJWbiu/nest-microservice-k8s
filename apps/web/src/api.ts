import axios from 'axios';
import { encodePassword } from './encrypt';
import {
  OAuthClients,
  OAuthTokenResponse,
  AccountDto,
  ProductDto,
  AdvertisementDto,
  SettlementDto,
  PaymentDto,
  PaymentState,
} from '@bookstore/shared';

const api = axios.create({ timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(username: string, password: string) {
  const body = new URLSearchParams({
    grant_type: 'password',
    username,
    password: encodePassword(password),
    client_id: OAuthClients.frontend.clientId,
    client_secret: OAuthClients.frontend.clientSecret,
  });
  const { data } = await api.post<OAuthTokenResponse>('/oauth/token', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  localStorage.setItem('access_token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('refresh_token', data.refresh_token);
  }
  if (data.username) localStorage.setItem('username', data.username);
  return data;
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('username');
}

export async function register(account: AccountDto) {
  const { data } = await api.post('/restful/accounts', {
    ...account,
    password: account.password ? encodePassword(account.password) : undefined,
  });
  return data;
}

export async function getAccount(username: string) {
  const { data } = await api.get<AccountDto>(`/restful/accounts/${username}`);
  return data;
}

export async function listProducts() {
  const { data } = await api.get<ProductDto[]>('/restful/products');
  return data;
}

export async function getProduct(id: number) {
  const { data } = await api.get<ProductDto>(`/restful/products/${id}`);
  return data;
}

export async function listAds() {
  const { data } = await api.get<AdvertisementDto[]>('/restful/advertisements');
  return data;
}

export async function createSettlement(settlement: SettlementDto) {
  const { data } = await api.post<PaymentDto>('/restful/settlements', settlement);
  return data;
}

export async function updatePayment(payId: string, state: PaymentState) {
  const { data } = await api.patch(`/restful/pay/${payId}`, null, {
    params: { state },
  });
  return data;
}

export { api };
