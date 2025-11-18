# 🚀 Configuração do Pipeline CI/CD - Trigger Automático

## 📋 Resumo

Este documento explica como configurar o pipeline Jenkins para executar automaticamente a cada commit no repositório Git.

## 🔧 Configurações Necessárias

### 1. **Plugins do Jenkins (Obrigatórios)**

Instale estes plugins no Jenkins:
```
- GitHub Plugin
- Generic Webhook Trigger Plugin
- Pipeline Plugin
- Pipeline: Stage View Plugin
- HTML Publisher Plugin
- Coverage Plugin (Cobertura)
- JUnit Plugin
```

### 2. **Configuração do Job Jenkins**

1. **Criar novo Pipeline Job:**
   ```
   Dashboard → New Item → Pipeline → Nome: auth-min
   ```

2. **Configurar Source Code Management:**
   ```
   Pipeline → Definition: Pipeline script from SCM
   SCM: Git
   Repository URL: https://github.com/seu-usuario/auth-min.git
   Branch: */main (ou sua branch principal)
   Script Path: Jenkinsfile
   ```

3. **Configurar Build Triggers:**
   - ✅ GitHub hook trigger for GITScm polling
   - ✅ Poll SCM: `H/2 * * * *` (verifica a cada 2 minutos)
   - ✅ Generic Webhook Trigger (configurado no Jenkinsfile)

## 🔄 Métodos de Trigger

### **Método 1: GitHub Webhook (Recomendado)**

**Configuração automática:**
```bash
./scripts/setup-github-webhook.sh
```

**Configuração manual:**
1. No GitHub: `Settings → Webhooks → Add webhook`
2. **Payload URL:** `http://seu-jenkins:8080/github-webhook/`
3. **Content type:** `application/json`
4. **Events:** Push, Pull requests
5. **Active:** ✅

### **Método 2: Generic Webhook Trigger**

URL do webhook:
```
http://seu-jenkins:8080/generic-webhook-trigger/invoke?token=auth-min-webhook-token
```

### **Método 3: Polling SCM (Fallback)**

Configurado no Jenkinsfile para verificar mudanças a cada 2 minutos:
```groovy
triggers {
  pollSCM('H/2 * * * *')
}
```

## 🎯 Fluxo do Pipeline

### **Triggers Configurados:**
```groovy
triggers {
  githubPush()                    // Trigger imediato no push
  pollSCM('H/2 * * * *')         // Polling a cada 2 minutos
  GenericTrigger(...)             // Webhook customizado
}
```

### **Stages que Executam em TODOS os Commits:**
1. ✅ **Pre-build Setup** - Instalar dependências
2. ✅ **Checkout & Cache** - Cache node_modules
3. ✅ **Prisma Setup** - Gerar clients
4. ✅ **Code Quality** - ESLint + Prettier
5. ✅ **Unit Tests** - Testes unitários com coverage
6. ✅ **E2E Tests** - Testes end-to-end
7. ✅ **Test Results Summary** - Relatórios consolidados

### **Stages Condicionais (main/develop/staging):**
8. 🔀 **Build Application** - Build para produção
9. 🔀 **Security Audit** - Auditoria de segurança
10. 🔀 **Docker Build & Scan** - Build e scan de imagem
11. 🔀 **Push to Registry** - Push para registry
12. 🔀 **Deploy** - Deploy automático
13. 🔀 **Health Check** - Verificação de saúde

## 📊 Relatórios Gerados

A cada execução, o pipeline gera:

- **Test Results:** `coverage/junit.xml` + `test-results/junit.xml`
- **Coverage Report:** `coverage/cobertura-coverage.xml`
- **ESLint Report:** `eslint-reports/eslint-report.html`
- **Build Artifacts:** `dist/**` (apenas em branches principais)

## ⚡ Comandos para Teste Local

```bash
# Executar todos os testes (simula CI)
npm run ci:test

# Apenas testes unitários
npm run test:coverage

# Apenas testes e2e  
npm run test:e2e

# Setup ambiente de teste
npm run test:setup
```

## 🔍 Verificação da Configuração

### **1. Testar Webhook:**
```bash
# Fazer um commit simples
git add .
git commit -m "test: trigger pipeline"
git push origin main
```

### **2. Verificar no Jenkins:**
1. Acesse: `http://seu-jenkins:8080/job/auth-min/`
2. Verifique se o build foi triggerado automaticamente
3. Confira os logs: `Console Output`

### **3. Validar Relatórios:**
- **Test Results:** Menu lateral → Test Results
- **Coverage:** Menu lateral → Coverage Report  
- **Artifacts:** Menu lateral → Build Artifacts

## ❗ Troubleshooting

### **Webhook não funciona:**
1. Verificar URL do Jenkins acessível pelo GitHub
2. Verificar firewall/proxy
3. Testar com ngrok para desenvolvimento local

### **Testes falham:**
1. Verificar dependências: `npm ci`
2. Verificar banco de teste: `npm run db:setup:test`
3. Verificar logs: Jenkins Console Output

### **Pipeline não triggera:**
1. Verificar plugins instalados
2. Verificar configuração SCM polling
3. Verificar logs do webhook: Jenkins → Manage → System Log

## 🎉 Resultado Final

Com esta configuração, **qualquer commit** em qualquer branch irá:

1. ✅ Triggar automaticamente o pipeline
2. ✅ Executar todos os testes (unitários + e2e)  
3. ✅ Gerar relatórios de coverage e qualidade
4. ✅ Falhar o build se houver testes quebrados
5. ✅ Notificar o status via Slack/email (configurado)

**Deploy automático** ocorre apenas em branches: `main`, `develop`, `staging`