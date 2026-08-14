# syntax=docker/dockerfile:1
ARG SERVICE=account
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS build
ARG SERVICE=account
COPY package.json pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/account/package.json ./apps/account/package.json
COPY apps/security/package.json ./apps/security/package.json
COPY apps/warehouse/package.json ./apps/warehouse/package.json
COPY apps/payment/package.json ./apps/payment/package.json
COPY apps/gateway/package.json ./apps/gateway/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/${SERVICE} ./apps/${SERVICE}
RUN pnpm install --filter "@bookstore/${SERVICE}..."
RUN pnpm --filter "@bookstore/${SERVICE}..." build

FROM node:20-alpine AS runner
ARG SERVICE=account
WORKDIR /app/apps/${SERVICE}
ENV NODE_ENV=production
ENV PORT=80
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/packages /app/packages
COPY --from=build /app/apps/${SERVICE} ./
EXPOSE 80
CMD ["node", "dist/main.js"]
