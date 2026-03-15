FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3009

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3009"]
