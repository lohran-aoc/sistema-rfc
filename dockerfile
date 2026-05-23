FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependência
COPY backend/package*.json ./
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Criar diretório para o banco de dados
RUN mkdir -p /data

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["node", "backend/server.js"]