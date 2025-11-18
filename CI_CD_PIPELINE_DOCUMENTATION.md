# Pipeline CI/CD para auth-min

## Visão Geral

Este documento descreve a implementação completa do pipeline CI/CD para o projeto auth-min usando Jenkins, Docker e Trivy para segurança.

## 📋 Índice

1. [Arquitetura do Pipeline](#arquitetura-do-pipeline)
2. [Configuração Inicial](#configuração-inicial)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Fases do Pipeline](#fases-do-pipeline)
5. [Ambientes](#ambientes)
6. [Segurança](#segurança)
7. [Monitoramento](#monitoramento)
8. [Troubleshooting](#troubleshooting)

## 🏗️ Arquitetura do Pipeline

### Componentes Principais

- **Jenkins**: Orquestração do pipeline CI/CD
- **Docker**: Containerização da aplicação
- **Trivy**: Scanner de segurança para vulnerabilidades
- **PostgreSQL**: Banco de dados principal
- **Prisma**: ORM para interações com banco de dados

### Fluxo de Trabalho

```mermaid
graph TD
    A[Commit/Push] --> B[Trigger Jenkins]
    B --> C[Checkout & Cache]
    C --> D[Install Dependencies]
    D --> E[Prisma Generate]
    E --> F[Lint & Format Check]
    F --> G[Unit Tests]
    G --> H[E2E Tests]
    H --> I[Build Application]
    I --> J[Security Audit]
    J --> K[Docker Build]
    K --> L[Trivy Security Scan]
    L --> M[Push to Registry]
    M --> N[Deploy to Environment]
    N --> O[Health Check]
```

## ⚙️ Configuração Inicial

### 1. Requisitos do Jenkins

```bash
# Plugins necessários
- Docker Pipeline
- Multibranch Pipeline
- Blue Ocean (opcional)
- Slack Notification (opcional)
- JUnit
- Cobertura
- HTML Publisher
```

### 2. Credenciais Necessárias

Configure as seguintes credenciais no Jenkins:

```bash
# Docker Registry
docker-registry          # Username/Password para registry
docker-hub-credentials   # Para Docker Hub

# Notificações
slack-token             # Token do Slack (opcional)

# Banco de Dados (Production)
postgres-credentials    # Username/Password do PostgreSQL
redis-credentials      # Password do Redis (quando implementado)
```

### 3. Variáveis de Ambiente

```bash
# Essenciais
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-key

# Opcionais
REDIS_URL=redis://user:password@host:port
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info
```

## 📁 Estrutura de Arquivos

```
auth-min/
├── Jenkinsfile                          # Pipeline principal
├── docker-compose.yml                   # Ambiente local
├── docker-compose.develop.yml           # Ambiente de desenvolvimento
├── docker-compose.staging.yml           # Ambiente de staging
├── docker-compose.main.yml             # Ambiente de produção
├── docker-compose.develop.simple.yml   # Versão sem Redis
├── Dockerfile                          # Build da aplicação
├── .eslintrc.js                        # Configuração ESLint
├── .prettierrc                         # Configuração Prettier
├── .trivyignore                        # Exclusões do Trivy
├── scripts/
│   ├── security-scan.sh                # Script de segurança
│   └── trivy-install.sh                # Instalação do Trivy
├── security/
│   └── trivy-config.yaml              # Configuração do Trivy
└── package.json                        # Scripts de lint/test
```

## 🔄 Fases do Pipeline

### 1. Pre-build Setup
- Instalação de dependências do sistema
- Verificação de ferramentas (Docker, Node.js)
- Configuração do ambiente

### 2. Checkout & Cache
```bash
npm ci --cache /tmp/.npm
npm run prisma:generate
npm run prisma:generate:test
```

### 3. Code Quality (Paralelo)
- **Linting**: ESLint com correção automática
- **Formatting**: Prettier check
- Falhas aqui bloqueiam o pipeline

### 4. Testes
- **Unit Tests**: Jest com coverage
- **E2E Tests**: Configuração de banco de teste SQLite
- Relatórios publicados no Jenkins

### 5. Build
```bash
npm run build
# Artefatos armazenados em dist/
```

### 6. Security Audit (Paralelo)
- **NPM Audit**: Vulnerabilidades em dependências
- **Prisma Format**: Consistência do schema
- Falhas em HIGH/CRITICAL bloqueiam pipeline

### 7. Docker Build & Scan
```bash
# Build da imagem
docker build -t auth-min:${GIT_COMMIT} .

# Scan de segurança
trivy image --exit-code 1 \
  --severity HIGH,CRITICAL \
  auth-min:${GIT_COMMIT}
```

### 8. Deploy (Apenas main/develop/staging)
- Push para registry
- Deploy usando Docker Compose
- Health check automático

## 🌍 Ambientes

### Development (Branch: develop)
- **URL**: http://localhost:3001
- **Database**: PostgreSQL local (porta 5433)
- **Features**: Logs detalhados, hot reload
- **Docker Compose**: `docker-compose.develop.simple.yml`

### Staging (Branch: staging)
- **URL**: http://localhost:3002
- **Database**: PostgreSQL dedicado (porta 5434)
- **Features**: Ambiente de testes, rate limiting
- **Docker Compose**: `docker-compose.staging.yml`

### Production (Branch: main)
- **URL**: http://localhost:3000
- **Database**: PostgreSQL produção (porta 5435)
- **Features**: Alta disponibilidade, monitoramento
- **Docker Compose**: `docker-compose.main.yml`

## 🔒 Segurança

### Trivy Security Scanning

#### Configuração
```yaml
# security/trivy-config.yaml
vulnerability:
  severity: [HIGH, CRITICAL]
  ignore-unfixed: true
```

#### Execução Manual
```bash
# Scan completo
./scripts/security-scan.sh

# Scan específico
./scripts/security-scan.sh -t filesystem
./scripts/security-scan.sh -t image -i auth-min:latest
```

### Vulnerability Management

1. **Dependências NPM**
   ```bash
   npm audit --audit-level high --production
   ```

2. **Imagens Docker**
   ```bash
   trivy image --severity HIGH,CRITICAL auth-min:latest
   ```

3. **Código Fonte**
   ```bash
   trivy fs --severity HIGH,CRITICAL .
   ```

### Secret Scanning
- Trivy detecta secrets em código
- Exclusões configuradas em `.trivyignore`
- Nunca commitar credenciais reais

## 📊 Monitoramento

### Health Checks
```typescript
// Endpoint: /health
{
  "status": "ok",
  "timestamp": "2023-11-18T10:00:00Z",
  "uptime": 3600,
  "database": "connected"
}
```

### Métricas (Produção)
- **Prometheus**: Coleta de métricas
- **Grafana**: Dashboards visuais
- **Alerting**: Notificações automáticas

### Logging
```bash
# Desenvolvimento
LOG_LEVEL=debug

# Staging
LOG_LEVEL=info

# Produção  
LOG_LEVEL=warn
```

## 🔧 Scripts Úteis

### Desenvolvimento Local
```bash
# Instalar dependências e setup
npm ci
npm run prisma:generate
npm run db:setup:test

# Executar testes
npm run test
npm run test:e2e

# Linting e formatação
npm run lint
npm run format

# Build local
npm run build
```

### Docker Local
```bash
# Build da imagem
docker build -t auth-min:local .

# Executar ambiente completo
docker-compose up -d

# Logs
docker-compose logs -f auth-min

# Parar ambiente
docker-compose down
```

### Segurança
```bash
# Instalar Trivy
./scripts/trivy-install.sh

# Executar scan completo
./scripts/security-scan.sh

# Scan rápido de imagem
./scripts/security-scan.sh -t image -i auth-min:latest
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Falhas de Teste
```bash
# Verificar logs
docker-compose logs auth-min

# Executar testes localmente
npm run test:e2e:ci

# Verificar banco de teste
npm run db:setup:test
```

#### 2. Vulnerabilidades Bloqueando Pipeline
```bash
# Verificar vulnerabilidades
npm audit --audit-level high

# Atualizar dependências
npm update

# Ignorar vulnerabilidades específicas (temporário)
# Adicionar CVE no .trivyignore
```

#### 3. Problemas de Build Docker
```bash
# Verificar Dockerfile
docker build --no-cache -t auth-min:debug .

# Executar interativamente
docker run -it auth-min:debug /bin/sh

# Verificar health check
curl http://localhost:3000/health
```

#### 4. Falhas de Deploy
```bash
# Verificar status dos containers
docker-compose ps

# Verificar logs do banco
docker-compose logs postgres

# Reiniciar serviços
docker-compose restart auth-min
```

### Logs do Jenkins

#### Localização de Logs
```bash
# Logs do workspace
${JENKINS_HOME}/workspace/${JOB_NAME}/

# Logs de build específico
${JENKINS_HOME}/workspace/${JOB_NAME}/${BUILD_NUMBER}/
```

#### Debug do Pipeline
```groovy
// Adicionar no Jenkinsfile para debug
echo "Environment: ${env.BRANCH_NAME}"
echo "Commit: ${env.GIT_COMMIT}"
sh 'env | sort'  // Mostrar todas as variáveis
```

## 📝 Checklist de Deploy

### Pré-deploy
- [ ] Todos os testes passando
- [ ] Scan de segurança limpo  
- [ ] Revisão de código aprovada
- [ ] Variáveis de ambiente configuradas
- [ ] Backup do banco de dados (produção)

### Deploy
- [ ] Pipeline executado com sucesso
- [ ] Health check OK
- [ ] Verificação manual da aplicação
- [ ] Monitoramento ativo

### Pós-deploy
- [ ] Métricas estáveis
- [ ] Logs sem erros críticos
- [ ] Funcionalidades principais testadas
- [ ] Documentação atualizada

## 🚀 Melhorias Futuras

### Performance
- [ ] Cache de dependências NPM otimizado
- [ ] Multi-stage builds otimizados
- [ ] Paralelização de testes

### Segurança
- [ ] SAST (Static Application Security Testing)
- [ ] Dependency scanning automático
- [ ] Container image signing

### Observabilidade
- [ ] Distributed tracing
- [ ] Custom metrics
- [ ] APM integration

### DevOps
- [ ] GitOps com ArgoCD
- [ ] Kubernetes deployment
- [ ] Blue/green deployments

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar este documento
2. Consultar logs do Jenkins
3. Executar testes localmente
4. Contactar equipe DevOps

**Última atualização**: 18/11/2024