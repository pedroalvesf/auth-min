# 📜 Guia dos Scripts - Versão Simplificada

## 📁 Scripts Essenciais (3 apenas)

### **⭐ `setup-test-env.sh` - ESSENCIAL**
```bash
./scripts/setup-test-env.sh
# ou
npm run ci:test
```
**Função:**
- ✅ Configura ambiente de teste SQLite
- ✅ Roda todos os testes (unitários + e2e) 
- ✅ Usado pelo pipeline Jenkins
- ✅ Gera relatórios de coverage

**Quando usar:** Sempre que quiser rodar o pipeline completo localmente

---

### **🐳 `start-jenkins-simple.sh` - ÚTIL**
```bash
./scripts/start-jenkins-simple.sh
```
**Função:**
- ✅ Inicia Jenkins com Docker de forma simples
- ✅ Mostra senha inicial automaticamente
- ✅ Para restart rápido do Jenkins

**Quando usar:** Para iniciar/reiniciar Jenkins rapidamente

---

### **🔒 `security-scan.sh` - OPCIONAL**
```bash
./scripts/security-scan.sh
```
**Função:**
- ✅ Executa scans de segurança com Trivy
- ✅ Verifica vulnerabilidades no código e Docker
- ✅ Gera relatórios de segurança

**Quando usar:** Antes de fazer deploy em produção

---

## 🗑️ Scripts Removidos (eram redundantes)

- ❌ `setup-jenkins.sh` - Só documentação
- ❌ `start-jenkins.sh` - Versão complexa desnecessária  
- ❌ `setup-jenkins-job.sh` - Job já foi criado
- ❌ `setup-github-webhook.sh` - Não funciona com localhost
- ❌ `trivy-install.sh` - Trivy pode ser instalado via Homebrew

---

## 🎯 Comandos Principais do Projeto

### **Para Development:**
```bash
npm run dev              # Rodar aplicação em desenvolvimento
npm run test            # Testes unitários
npm run test:e2e        # Testes e2e 
npm run ci:test         # Pipeline completo (mesmo do Jenkins)
```

### **Para Jenkins:**
```bash
./scripts/start-jenkins-simple.sh    # Iniciar Jenkins
# Acesse: http://localhost:8080
```

### **Para Segurança (Opcional):**
```bash
brew install aquasecurity/trivy/trivy  # Instalar Trivy
./scripts/security-scan.sh             # Executar scan
```

---

## 📊 Pipeline Jenkins

O pipeline Jenkins usa automaticamente:
1. **✅ `npm run ci:test`** - que chama `./scripts/setup-test-env.sh`
2. **✅ Polling Git** - verifica mudanças a cada 2 minutos
3. **✅ Testes automatizados** - falha se algum teste quebrar

**📝 Resultado:** Pipeline simples, funcional e sem scripts desnecessários!