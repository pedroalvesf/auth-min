#!/bin/bash

# Script simples para iniciar Jenkins
set -e

echo "🚀 Iniciando Jenkins (versão simples)"
echo "===================================="

# 1. Parar qualquer container Jenkins existente
echo "🛑 Parando containers Jenkins existentes..."
docker stop jenkins-auth-min 2>/dev/null || true
docker rm jenkins-auth-min 2>/dev/null || true

# 2. Iniciar Jenkins com configuração básica
echo "🐳 Iniciando Jenkins..."
docker run -d \
  --name jenkins-auth-min \
  --restart=unless-stopped \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

echo ""
echo "⏳ Aguardando Jenkins inicializar (60 segundos)..."
sleep 20

# 3. Verificar se está rodando
echo "📊 Status do container:"
docker ps | head -1
docker ps | grep jenkins || echo "❌ Jenkins não está rodando"

echo ""
echo "📝 Para obter a senha inicial:"
echo "docker exec jenkins-auth-min cat /var/jenkins_home/secrets/initialAdminPassword"

echo ""
echo "🌐 Acesse Jenkins em: http://localhost:8080"
echo ""

# 4. Tentar obter senha inicial
echo "🔐 Tentando obter senha inicial..."
sleep 10
PASSWORD=$(docker exec jenkins-auth-min cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null || echo "Ainda não disponível")
echo "Senha inicial: $PASSWORD"

if [ "$PASSWORD" != "Ainda não disponível" ]; then
    echo ""
    echo "✅ Jenkins está rodando!"
    echo "📋 INFORMAÇÕES DE LOGIN:"
    echo "URL: http://localhost:8080" 
    echo "Senha inicial: $PASSWORD"
    echo ""
    echo "📝 Próximos passos:"
    echo "1. Acesse http://localhost:8080"
    echo "2. Use a senha: $PASSWORD"
    echo "3. Instale plugins sugeridos"
    echo "4. Crie usuário admin"
    echo "5. Execute: ./scripts/setup-jenkins-job.sh"
else
    echo ""
    echo "⏳ Jenkins ainda está inicializando..."
    echo "Aguarde mais alguns minutos e execute:"
    echo "docker exec jenkins-auth-min cat /var/jenkins_home/secrets/initialAdminPassword"
fi