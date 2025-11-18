#!/bin/bash

# Script para configurar e iniciar Jenkins
echo "🚀 Setup do Jenkins para auth-min"
echo "=================================="

# Verificar se Jenkins está instalado
if ! command -v jenkins &> /dev/null && ! command -v brew &> /dev/null; then
    echo "❌ Jenkins não encontrado. Instalando..."
    
    # macOS com Homebrew
    if command -v brew &> /dev/null; then
        echo "📦 Instalando Jenkins via Homebrew..."
        brew install jenkins-lts
    else
        echo "📝 Instale o Jenkins manualmente:"
        echo "- macOS: brew install jenkins-lts"
        echo "- Ubuntu: sudo apt install openjdk-11-jdk && wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -"
        echo "- Docker: docker run -p 8080:8080 -p 50000:50000 jenkins/jenkins:lts"
        exit 1
    fi
fi

echo ""
echo "🔧 OPÇÕES PARA RODAR JENKINS:"
echo ""
echo "1. 🐳 DOCKER (Recomendado para teste):"
echo "   docker run -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts"
echo ""
echo "2. 💻 LOCAL:"
echo "   jenkins --httpPort=8080"
echo ""
echo "3. 🍺 HOMEBREW:"
echo "   brew services start jenkins-lts"
echo ""

echo "📍 URLs de Acesso:"
echo "- Jenkins: http://localhost:8080"
echo "- Logs: tail -f /var/log/jenkins/jenkins.log"
echo ""

echo "🔐 Para obter senha inicial:"
echo "- Docker: docker exec <container> cat /var/jenkins_home/secrets/initialAdminPassword"
echo "- Local: cat ~/.jenkins/secrets/initialAdminPassword"
echo "- Homebrew: cat /usr/local/var/jenkins_home/secrets/initialAdminPassword"
echo ""

echo "🔗 Plugins necessários:"
echo "- GitHub Plugin"
echo "- Generic Webhook Trigger Plugin"
echo "- Pipeline Plugin"
echo "- HTML Publisher Plugin"
echo "- Coverage Plugin"

echo ""
echo "📋 Próximos passos:"
echo "1. Acesse http://localhost:8080"
echo "2. Use a senha inicial para fazer login"
echo "3. Instale os plugins sugeridos"
echo "4. Crie um novo job Pipeline"
echo "5. Configure para usar este repositório Git"
echo "6. Execute: ./scripts/setup-github-webhook.sh"