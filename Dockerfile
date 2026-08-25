# syntax=docker/dockerfile:1

FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG DOCUSAURUS_SITE_URL=http://localhost:3000
ARG DOCUSAURUS_BASE_URL=/
ENV DOCUSAURUS_SITE_URL=${DOCUSAURUS_SITE_URL}
ENV DOCUSAURUS_BASE_URL=${DOCUSAURUS_BASE_URL}

RUN npm run build

FROM node:24-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=build --chown=node:node /app/build ./build
COPY --chown=node:node server.mjs ./server.mjs

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/health" || exit 1

CMD ["node", "server.mjs"]
