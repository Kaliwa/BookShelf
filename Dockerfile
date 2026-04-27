FROM node:20-alpine

WORKDIR /app

RUN corepack enable

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

RUN pnpm build

EXPOSE 3000

CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm prisma generate && pnpm start:prod"]
