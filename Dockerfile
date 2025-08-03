FROM node:22.17-alpine3.21

RUN apk add zip

ARG PNPM_VERSION
RUN test -n "$PNPM_VERSION" || (echo "PNPM_VERSION arg is required." && exit 1)

ENV PNPM_HOME="/pnpm"
RUN corepack enable
RUN corepack prepare pnpm@$PNPM_VERSION --activate
RUN pnpm config set update-notifier false

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --prod --frozen-lockfile

COPY src/lambda/ ./src/lambda/
COPY src/modules/ ./src/modules/

RUN zip -9rq lambda.zip src/lambda/ src/modules/ node_modules/
