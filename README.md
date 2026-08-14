# Fenix's Bookstore — NestJS + Kubernetes

NestJS 复刻版 [microservice_arch_kubernetes](https://github.com/fenixsoft/microservice_arch_kubernetes)（Fenix Bookstore）。

## 架构

| 服务 | 职责 | 本地端口 |
|------|------|----------|
| `web` | Vite + React + Ant Design 前端（集群内 nginx + NodePort 30080） | 5173 |
| `gateway` | HTTP 反向代理（对齐原 Zuul 路由） | 8080 |
| `security` | OAuth2（password / refresh / client_credentials）+ JWT | 8081 |
| `account` | 用户账户 | 8082 |
| `warehouse` | 商品 / 库存 / 广告 | 8083 |
| `payment` | 结算 / 支付 / 钱包 | 8084 |
| `postgres` | 三库隔离：`account` / `warehouse` / `payment` | 5432 |

治理方式与原项目一致：**K8s Service DNS 发现、ConfigMap 配置、kube-proxy 负载均衡**；无 Eureka / Config Server / Redis / MQ。

## 仓库结构

```
apps/           # gateway security account warehouse payment web
packages/       # shared nest-common
deploy/k8s/     # Kustomize manifests
docker-compose.yml
```

## 本地开发

```bash
# 1. 依赖
pnpm install

# 2. 启动 PostgreSQL（自动建库）
pnpm db:up

# 3. 构建共享包
pnpm --filter @bookstore/shared build
pnpm --filter @bookstore/nest-common build

# 4. 分别启动各服务（多终端）
pnpm dev:account
pnpm dev:security
pnpm dev:warehouse
pnpm dev:payment
pnpm dev:gateway
pnpm dev:web
```

访问：http://localhost:5173  
演示账号：`icyfenix` / `123456`（钱包余额 300）

## Kubernetes 部署

```bash
# 构建并部署（需本地 Docker + kubectl 集群）
skaffold run

# 或手动
docker build --build-arg SERVICE=account -t bookstore/account:latest .
# ... 同理 security/warehouse/payment/gateway
docker build -f apps/web/Dockerfile -t bookstore/web:latest .
kubectl apply -k deploy
```

浏览器访问：`http://localhost:30080`（Kind/Docker Desktop 等环境 NodePort 可用时）。

## API 契约（对齐原项目）

- `POST /oauth/token` — password / client_credentials / refresh_token
- `GET|POST|PUT /restful/accounts`
- `GET /restful/products`、`/restful/advertisements`
- `POST /restful/settlements`、`PATCH /restful/pay/:payId`

服务间调用：payment → warehouse（client_credentials）；security → account（本地签发 SERVICE token）。
