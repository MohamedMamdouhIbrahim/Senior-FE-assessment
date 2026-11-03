FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx nx build fe-test-workspace --configuration=production

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=4000

WORKDIR /app

COPY --from=build --chown=node:node /app/dist/apps/fe-test-workspace ./dist

USER node

EXPOSE 4000

CMD ["node", "dist/server/server.mjs"]
