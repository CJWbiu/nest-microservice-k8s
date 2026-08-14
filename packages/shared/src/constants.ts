export const Role = {
  USER: 'ROLE_USER',
  ADMIN: 'ROLE_ADMIN',
} as const;

export const Scope = {
  BROWSER: 'BROWSER',
  SERVICE: 'SERVICE',
} as const;

export const GrantType = {
  PASSWORD: 'password',
  REFRESH_TOKEN: 'refresh_token',
  CLIENT_CREDENTIALS: 'client_credentials',
} as const;

export const OAuthClients = {
  frontend: {
    clientId: 'bookstore_frontend',
    clientSecret: 'bookstore_secret',
    grantTypes: [GrantType.PASSWORD, GrantType.REFRESH_TOKEN],
    scopes: [Scope.BROWSER],
  },
  account: {
    clientId: 'account',
    clientSecret: 'account_secret',
    grantTypes: [GrantType.CLIENT_CREDENTIALS],
    scopes: [Scope.SERVICE],
  },
  warehouse: {
    clientId: 'warehouse',
    clientSecret: 'warehouse_secret',
    grantTypes: [GrantType.CLIENT_CREDENTIALS],
    scopes: [Scope.SERVICE],
  },
  payment: {
    clientId: 'payment',
    clientSecret: 'payment_secret',
    grantTypes: [GrantType.CLIENT_CREDENTIALS],
    scopes: [Scope.SERVICE],
  },
  security: {
    clientId: 'security',
    clientSecret: 'security_secret',
    grantTypes: [GrantType.CLIENT_CREDENTIALS],
    scopes: [Scope.SERVICE],
  },
} as const;

/** JWT signing key — same demo key as the Java original */
export const JWT_SIGNING_KEY = '601304E0-8AD4-40B0-BD51-0B432DC47461';

export const ACCESS_TOKEN_TTL_SECONDS = 3600;
export const REFRESH_TOKEN_TTL_SECONDS = 86400 * 7;

/** Default payment frozen expires: 2 minutes (ms) */
export const DEFAULT_PAYMENT_EXPIRES_MS = 2 * 60 * 1000;

/** Product list cache TTL: 4 minutes (ms) */
export const PRODUCT_CACHE_TTL_MS = 4 * 60 * 1000;

/** Fixed shipping fee to match original demo frontend */
export const SHIPPING_FEE = 12;
