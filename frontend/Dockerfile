FROM node:22-alpine

ENV HOST=0.0.0.0
ENV PORT=5173

WORKDIR /app

COPY package.json package-lock.json ./
COPY vite.config.js ./
RUN npm ci
RUN apk add --update curl
COPY index.html ./index.html
COPY public ./public
COPY src ./src

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]