import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();

  const account = process.env.ACCOUNT_URL || 'http://localhost:8082';
  const payment = process.env.PAYMENT_URL || 'http://localhost:8084';
  const warehouse = process.env.WAREHOUSE_URL || 'http://localhost:8083';
  const security = process.env.SECURITY_URL || 'http://localhost:8081';

  // Align with original Zuul routes (stripPrefix: false)
  const routes: Array<{ path: string; target: string }> = [
    { path: '/restful/accounts', target: account },
    { path: '/restful/pay', target: payment },
    { path: '/restful/settlements', target: payment },
    { path: '/restful/advertisements', target: warehouse },
    { path: '/restful/products', target: warehouse },
    { path: '/oauth', target: security },
  ];

  for (const route of routes) {
    expressApp.use(
      route.path,
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        pathRewrite: undefined,
        on: {
          error: (err, _req, res) => {
            console.error(`Proxy error for ${route.path}:`, err.message);
            if ('writeHead' in res) {
              (res as any).writeHead(502, { 'Content-Type': 'application/json' });
              (res as any).end(JSON.stringify({ message: 'Bad Gateway', error: err.message }));
            }
          },
        },
      }),
    );
  }

  expressApp.get('/health', (_req: any, res: any) => {
    res.json({ status: 'UP' });
  });

  const port = Number(process.env.PORT || 8080);
  await app.listen(port);
  console.log(`gateway listening on ${port}`);
}
bootstrap();
