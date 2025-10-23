# 📋 **Guia Completo para Testar a Aplicação com Postman**

## **1️⃣ Comandos para Subir a Aplicação**

### **Preparação do Ambiente:**
```bash
# 1. Instalar dependências (se ainda não instalou)
npm install

# 2. Verificar se o .env está configurado
cp .env.example .env

# 3. Configurar o banco de dados PostgreSQL
# Certifique-se que o PostgreSQL está rodando na porta 5432
# Com as credenciais do .env

# 4. Rodar as migrações do Prisma
npm run prisma:generate
npm run prisma:migrate

# 5. Iniciar a aplicação em modo desenvolvimento
npm run dev
```

A aplicação iniciará em: **http://localhost:3000** 🚀

## **2️⃣ Teste de Criação de Usuário**

### **Endpoint:** `POST http://localhost:3000/auth/user`

### **Headers Obrigatórios:**
```json
{
  "Content-Type": "application/json",
  "x-ipaddress": "192.168.1.1",
  "x-operatingsystem": "Windows 10",
  "x-browser": "Chrome 120",
  "x-type": "desktop"
}
```

### **Body (JSON):**
```json
{
  "email": "usuario@teste.com",
  "password": "senha123",
  "name": "João Silva"
}
```

### **Resposta Esperada (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ Guarde o `accessToken` para usar nas próximas requisições!**

## **3️⃣ Teste de Login (Autenticação)**

### **Endpoint:** `POST http://localhost:3000/login`

### **Headers:**
```json
{
  "Content-Type": "application/json",
  "x-ipaddress": "192.168.1.1",
  "x-operatingsystem": "Windows 10",
  "x-browser": "Chrome 120",
  "x-type": "desktop"
}
```

### **Body (JSON):**
```json
{
  "email": "usuario@teste.com",
  "password": "senha123"
}
```

### **Resposta Esperada (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## **4️⃣ Como Usar o Bearer Token**

### **No Postman:**
1. Vá na aba **Authorization**
2. Selecione o tipo: **Bearer Token**
3. Cole o `accessToken` (sem as aspas) no campo Token
4. Ou adicione manualmente no header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## **5️⃣ Configuração da Collection no Postman**

### **Criar Environment Variables:**
1. Crie um novo Environment no Postman
2. Adicione as variáveis:
   ```
   baseUrl = http://localhost:3000
   accessToken = (será preenchido automaticamente)
   refreshToken = (será preenchido automaticamente)
   ```

### **Script para Salvar Tokens Automaticamente:**
Na aba **Tests** do endpoint de login/criação, adicione:
```javascript
// Salva os tokens automaticamente no environment
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("accessToken", response.accessToken);
    pm.environment.set("refreshToken", response.refreshToken);
}
```

### **Usar Variáveis na URL:**
```
{{baseUrl}}/login
{{baseUrl}}/auth/user
```

### **Usar Token Automaticamente:**
Authorization → Bearer Token → `{{accessToken}}`

## **6️⃣ Troubleshooting**

### **Erros Comuns:**

**1. "Headers obrigatórios ausentes"**
- Certifique-se de enviar todos os headers x-*

**2. "Credenciais inválidas"**
- Verifique email/senha
- O usuário precisa existir no banco

**3. Erro de conexão com banco**
- Verifique se PostgreSQL está rodando
- Confirme credenciais no .env

**4. Porta 3000 em uso**
- Mude a porta no .env: `PORT=3001`

**5. "Headers não funcionam"**
- Use `Record<string, string>` no controller
- Acesse com `headers["header-name"]`

## **7️⃣ Collection Completa do Postman (JSON)**

Salve como `auth-min.postman_collection.json`:
```json
{
  "info": {
    "name": "Auth-Min API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "x-ipaddress",
            "value": "192.168.1.1"
          },
          {
            "key": "x-operatingsystem",
            "value": "Windows 10"
          },
          {
            "key": "x-browser",
            "value": "Chrome 120"
          },
          {
            "key": "x-type",
            "value": "desktop"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"usuario@teste.com\",\n  \"password\": \"senha123\",\n  \"name\": \"João Silva\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}/auth/user",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "user"]
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "type": "text/javascript",
            "exec": [
              "if (pm.response.code === 201) {",
              "    const response = pm.response.json();",
              "    pm.environment.set(\"accessToken\", response.accessToken);",
              "    pm.environment.set(\"refreshToken\", response.refreshToken);",
              "}"
            ]
          }
        }
      ]
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "x-ipaddress",
            "value": "192.168.1.1"
          },
          {
            "key": "x-operatingsystem",
            "value": "Windows 10"
          },
          {
            "key": "x-browser",
            "value": "Chrome 120"
          },
          {
            "key": "x-type",
            "value": "desktop"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"usuario@teste.com\",\n  \"password\": \"senha123\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}/login",
          "host": ["{{baseUrl}}"],
          "path": ["login"]
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "type": "text/javascript",
            "exec": [
              "if (pm.response.code === 201) {",
              "    const response = pm.response.json();",
              "    pm.environment.set(\"accessToken\", response.accessToken);",
              "    pm.environment.set(\"refreshToken\", response.refreshToken);",
              "}"
            ]
          }
        }
      ]
    }
  ]
}
```

## **8️⃣ Exemplo de Headers Personalizados**

### **Para diferentes dispositivos:**
```json
// Desktop Windows
{
  "x-ipaddress": "192.168.1.100",
  "x-operatingsystem": "Windows 11",
  "x-browser": "Chrome 120",
  "x-type": "desktop"
}

// Mobile Android
{
  "x-ipaddress": "192.168.1.101",
  "x-operatingsystem": "Android 13",
  "x-browser": "Chrome Mobile 120",
  "x-type": "mobile"
}

// Tablet iOS
{
  "x-ipaddress": "192.168.1.102",
  "x-operatingsystem": "iOS 17",
  "x-browser": "Safari Mobile",
  "x-type": "tablet"
}
```

## **9️⃣ Configuração de Ambiente (.env)**

```env
DATABASE_URL="postgresql://auth_user:auth_password@localhost:5432/auth_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

## **🔟 Comandos Úteis durante Desenvolvimento**

```bash
# Ver logs da aplicação
npm run dev

# Resetar banco de dados
npm run prisma:migrate reset

# Ver dados no banco
npm run prisma:studio

# Parar a aplicação
Ctrl + C

# Build para produção
npm run build
npm start
```

---

**Pronto!** Com este guia você pode testar completamente a autenticação da aplicação! 🚀

**Próximos passos:**
1. Siga os comandos para subir a aplicação
2. Importe a collection no Postman
3. Configure o environment
4. Execute os testes de criação de usuário e login
5. Use o Bearer token para endpoints protegidos