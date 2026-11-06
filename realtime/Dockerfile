# Зависимости ставятся ВНУТРИ образа, а не монтируются с хоста: tsx тянет
# esbuild, а он платформенный — macOS'ные бинарники в Linux не запустятся.
FROM node:22-alpine

WORKDIR /app

# Отдельным слоем, чтобы правка исходников не переустанавливала пакеты.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

CMD ["npm", "run", "realtime"]
