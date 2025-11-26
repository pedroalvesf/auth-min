#!/bin/bash

# Script para configurar ambiente de teste
# Usado no pipeline CI/CD

set -e

echo "🚀 Configurando ambiente de teste..."

# Gerar cliente Prisma para testes
echo "📦 Gerando cliente Prisma para testes..."
npm run prisma:generate:test

# Configurar banco de dados de teste
echo "🗄️  Configurando banco de dados de teste..."
export NODE_ENV=test
if [ -f .env.test ]; then
  export $(cat .env.test | grep -v '^#' | xargs)
fi
npx prisma migrate dev --schema=test/schema.prisma

# Executar testes unitários
echo "🧪 Executando testes unitários..."
npm run test

# Executar testes e2e
echo "🚀 Executando testes e2e..."
npm run test:e2e

echo "✅ Todos os testes passaram!"