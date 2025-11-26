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

# Use DATABASE_URL from environment if set (for Jenkins), otherwise use .env.test
if [ -n "$DATABASE_URL" ]; then
  echo "📍 Using environment DATABASE_URL: $DATABASE_URL"
  # Load other vars from .env.test except DATABASE_URL
  if [ -f .env.test ]; then
    export $(cat .env.test | grep -v '^#' | grep -v '^DATABASE_URL=' | xargs)
  fi
else
  # Load all vars from .env.test including DATABASE_URL
  if [ -f .env.test ]; then
    export $(cat .env.test | grep -v '^#' | xargs)
  fi
  echo "📍 Using .env.test DATABASE_URL: $DATABASE_URL"
fi

npx prisma migrate dev --schema=test/schema.prisma

# Executar testes unitários
echo "🧪 Executando testes unitários..."
npm run test

# Executar testes e2e
echo "🚀 Executando testes e2e..."
npm run test:e2e

echo "✅ Todos os testes passaram!"