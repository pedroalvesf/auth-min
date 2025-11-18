#!/bin/bash

# Script completo para iniciar Jenkins com senha pré-configurada
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando Jenkins para auth-min${NC}"
echo "=================================="

# 1. Criar senha inicial personalizada
JENKINS_PASSWORD="auth-min-2024"
echo -e "${YELLOW}📝 Criando senha inicial...${NC}"
echo "Senha do Jenkins: ${JENKINS_PASSWORD}"

# 2. Criar diretório para configuração
echo -e "${YELLOW}📁 Criando diretórios de configuração...${NC}"
mkdir -p ./jenkins_config/secrets
echo "${JENKINS_PASSWORD}" > ./jenkins_config/secrets/initialAdminPassword

# 3. Criar arquivo de configuração inicial
echo -e "${YELLOW}⚙️  Criando configuração inicial...${NC}"
cat > ./jenkins_config/jenkins.yaml << 'EOF'
jenkins:
  securityRealm:
    local:
      allowsSignup: false
      users:
        - id: "admin"
          password: "auth-min-2024"
          properties:
            - "jenkins.security.ApiTokenProperty"
  authorizationStrategy:
    globalMatrix:
      grantedPermissions:
        - "Overall/Administer:admin"
        - "Overall/Read:authenticated"

unclassified:
  location:
    url: "http://localhost:8080/"
    adminAddress: "admin@localhost"

tool:
  nodejs:
    installations:
      - name: "Node 20"
        properties:
          - installSource:
              installers:
                - nodeJSInstaller:
                    id: "20.11.0"
                    npmPackages: "npm@latest"
EOF

# 4. Criar lista de plugins necessários
echo -e "${YELLOW}🔌 Criando lista de plugins...${NC}"
cat > ./jenkins_config/plugins.txt << 'EOF'
workflow-aggregator
pipeline-stage-view
git
github
generic-webhook-trigger
htmlpublisher
cobertura
junit
nodejs
docker-workflow
build-timeout
timestamper
ws-cleanup
ant
gradle
pipeline-github-lib
pipeline-utility-steps
EOF

# 5. Criar Dockerfile customizado para Jenkins
echo -e "${YELLOW}🐳 Criando Dockerfile customizado...${NC}"
cat > ./jenkins_config/Dockerfile << 'EOF'
FROM jenkins/jenkins:lts

# Switch to root to install plugins and configure
USER root

# Install additional tools
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy plugins list and install
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

# Copy initial configuration
COPY jenkins.yaml /usr/share/jenkins/ref/jenkins.yaml
COPY secrets/ /usr/share/jenkins/ref/secrets/

# Set environment for configuration as code
ENV CASC_JENKINS_CONFIG=/usr/share/jenkins/ref/jenkins.yaml
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

# Switch back to jenkins user
USER jenkins
EOF

# 6. Atualizar docker-compose para usar configuração customizada
echo -e "${YELLOW}📝 Atualizando docker-compose.jenkins.yml...${NC}"
cat > ./docker-compose.jenkins.yml << 'EOF'
version: '3.8'
services:
  jenkins:
    build:
      context: ./jenkins_config
      dockerfile: Dockerfile
    container_name: jenkins-auth-min
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - JAVA_OPTS=-Djenkins.install.runSetupWizard=false
      - CASC_JENKINS_CONFIG=/usr/share/jenkins/ref/jenkins.yaml
    networks:
      - jenkins-network

volumes:
  jenkins_home:
    driver: local

networks:
  jenkins-network:
    driver: bridge
EOF

echo ""
echo -e "${GREEN}✅ Configuração criada com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 INFORMAÇÕES DE LOGIN:${NC}"
echo -e "URL: ${YELLOW}http://localhost:8080${NC}"
echo -e "Usuário: ${YELLOW}admin${NC}" 
echo -e "Senha: ${YELLOW}${JENKINS_PASSWORD}${NC}"
echo ""

echo -e "${YELLOW}🚀 Iniciando Jenkins...${NC}"
docker-compose -f docker-compose.jenkins.yml up --build -d

echo ""
echo -e "${BLUE}📊 Status dos containers:${NC}"
docker ps | grep jenkins

echo ""
echo -e "${YELLOW}📝 Para ver os logs:${NC}"
echo "docker logs -f jenkins-auth-min"

echo ""
echo -e "${YELLOW}⏳ Aguarde cerca de 2-3 minutos para o Jenkins inicializar completamente...${NC}"

echo ""
echo -e "${GREEN}🎉 Jenkins iniciado! Acesse http://localhost:8080${NC}"
echo -e "${BLUE}👤 Login: admin / auth-min-2024${NC}"