#!/bin/bash

# Script para instalar Docker CLI dentro do container Jenkins
set -e

echo "🐳 Instalando Docker CLI no container Jenkins"
echo "============================================="

# Verificar se o container está rodando
if ! docker ps | grep -q jenkins-auth-min; then
    echo "❌ Container Jenkins não está rodando!"
    echo "Execute primeiro: ./scripts/start-jenkins-simple.sh"
    exit 1
fi

echo "📦 Instalando Docker CLI no container..."

# Detectar arquitetura
ARCH=$(docker exec jenkins-auth-min uname -m)
if [ "$ARCH" = "aarch64" ]; then
    DOCKER_ARCH="arm64"
else
    DOCKER_ARCH="amd64"
fi

echo "Arquitetura detectada: $ARCH -> Docker arch: $DOCKER_ARCH"

docker exec --user root jenkins-auth-min bash -c "
    # Atualizar repositórios
    apt-get update
    
    # Instalar dependências
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Adicionar chave GPG oficial do Docker
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Adicionar repositório Docker com arquitetura correta
    echo \"deb [arch=$DOCKER_ARCH signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \$(lsb_release -cs) stable\" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker CLI
    apt-get update
    apt-get install -y docker-ce-cli
    
    # Verificar instalação
    docker --version
"

# Verificar se Docker está funcionando
echo "✅ Testando Docker no container..."
docker exec jenkins-auth-min docker --version

echo ""
echo "✅ Docker CLI instalado com sucesso!"
echo "🔄 Reiniciando Jenkins para aplicar mudanças..."

# Reiniciar Jenkins
docker restart jenkins-auth-min

echo "⏳ Aguardando Jenkins reinicializar (30 segundos)..."
sleep 30

echo ""
echo "✅ Pronto! Docker está disponível no Jenkins"
echo "🌐 Acesse: http://localhost:8080"