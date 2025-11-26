#!/bin/bash

# Script para configurar ambiente de teste
# Usado no pipeline CI/CD

set -e

echo "🚀 Configurando ambiente de teste..."

# Carregar variáveis de ambiente
export NODE_ENV=test
if [ -f .env.test ]; then
  export $(cat .env.test | grep -v '^#' | xargs)
  echo "📁 Loaded variables from .env.test"
fi

# Override with environment DATABASE_URL if set (for Jenkins)
if [ -n "$DATABASE_URL" ]; then
  echo "🔄 Using environment DATABASE_URL: $DATABASE_URL"
fi

echo "✅ Environment setup completed!"