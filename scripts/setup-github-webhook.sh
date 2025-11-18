#!/bin/bash

# Script para configurar webhook do GitHub com Jenkins
# Execute este script com as informações do seu Jenkins

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Configuração de Webhook GitHub → Jenkins${NC}"
echo ""

# Verificar se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) não está instalado.${NC}"
    echo "Instale com: brew install gh (macOS) ou https://cli.github.com/"
    exit 1
fi

# Verificar se está logado no GitHub
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Faça login no GitHub primeiro:${NC}"
    echo "gh auth login"
    exit 1
fi

# Solicitar informações do Jenkins
read -p "🔧 URL do Jenkins (ex: http://jenkins.empresa.com:8080): " JENKINS_URL
read -p "🔧 Nome do job/projeto (ex: auth-min): " JOB_NAME

# URLs do webhook
WEBHOOK_URL="${JENKINS_URL}/github-webhook/"
GENERIC_WEBHOOK_URL="${JENKINS_URL}/generic-webhook-trigger/invoke?token=auth-min-webhook-token"

echo ""
echo -e "${YELLOW}📝 Configurando webhook...${NC}"

# Criar webhook usando GitHub CLI
gh api \
  --method POST \
  repos/:owner/:repo/hooks \
  --field name='web' \
  --field active=true \
  --field config[url]="${WEBHOOK_URL}" \
  --field config[content_type]='application/json' \
  --field config[insecure_ssl]='0' \
  --field events[]='push' \
  --field events[]='pull_request'

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Webhook configurado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao configurar webhook.${NC}"
    echo -e "${YELLOW}Configure manualmente no GitHub:${NC}"
    echo "1. Vá em: Settings → Webhooks → Add webhook"
    echo "2. Payload URL: ${WEBHOOK_URL}"
    echo "3. Content type: application/json"
    echo "4. Events: Push, Pull requests"
fi

echo ""
echo -e "${BLUE}📋 Resumo da Configuração:${NC}"
echo -e "Jenkins URL: ${JENKINS_URL}"
echo -e "Job Name: ${JOB_NAME}"
echo -e "Webhook URL: ${WEBHOOK_URL}"
echo -e "Generic Trigger: ${GENERIC_WEBHOOK_URL}"

echo ""
echo -e "${GREEN}🎉 Configuração concluída!${NC}"
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo "1. Configure seu Jenkins job para usar o Jenkinsfile"
echo "2. Instale os plugins necessários no Jenkins:"
echo "   - GitHub Plugin"
echo "   - Generic Webhook Trigger Plugin"
echo "   - Pipeline Plugin"
echo "3. Faça um commit para testar o trigger automático"

echo ""
echo -e "${BLUE}🔧 Plugins necessários no Jenkins:${NC}"
echo "- GitHub Plugin"
echo "- Generic Webhook Trigger Plugin" 
echo "- Pipeline: Stage View Plugin"
echo "- HTML Publisher Plugin"
echo "- Cobertura Plugin"