FROM node:22.17-alpine3.21

RUN apk add zip

WORKDIR /app

ENV PNPM_VERSION=10.12.4

ENV PNPM_HOME="/pnpm"
RUN corepack enable
RUN corepack prepare pnpm@$PNPM_VERSION --activate
RUN pnpm config set update-notifier false

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --prod --frozen-lockfile

COPY src/lambda/ ./src/lambda/
COPY src/modules/ ./src/modules/

RUN pnpm lambda:zip
