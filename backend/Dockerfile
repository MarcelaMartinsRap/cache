FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código
COPY . .

# Gerar o Prisma Client
RUN npx prisma generate

# Expor a porta
EXPOSE 3001

# Comando padrão (será sobrescrito pelo docker-compose)
CMD ["npm", "run", "dev"]
