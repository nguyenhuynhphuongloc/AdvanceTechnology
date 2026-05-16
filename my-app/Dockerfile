FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3009

CMD ["pnpm", "exec", "next", "dev", "--hostname", "0.0.0.0", "--port", "3009"]
