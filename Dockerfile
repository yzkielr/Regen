FROM node:24-bookworm-slim AS base
RUN npm install --global pnpm@12.3.4
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ENV NODE_OPTIONS=--max-old-space-size=2048
RUN pnpm build

FROM base AS runtime
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 3000
CMD ["sh","scripts/hostinger-start.sh"]
