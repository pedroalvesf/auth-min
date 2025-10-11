# 🏗️ Auth-Min - Architecture & Study Guide

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura DDD + Clean Architecture](#-arquitetura-ddd--clean-architecture)
3. [Estrutura de Diretórios](#-estrutura-de-diretórios)
4. [Fluxo de Dados](#-fluxo-de-dados)
5. [Componentes Principais](#-componentes-principais)
6. [Implementações Nativas](#-implementações-nativas)
7. [Sistema de Roles e Permissões](#-sistema-de-roles-e-permissões)
8. [Histórico de Logins](#-histórico-de-logins)
9. [Como Integrar com Outros Projetos](#-como-integrar-com-outros-projetos)
10. [Performance e Otimizações](#-performance-e-otimizações)

---

## 🎯 Visão Geral

O **Auth-Min** é um projeto de autenticação otimizado que serve como **projeto base** para outros projetos. Construído com:

- **Domain Driven Design (DDD)**
- **Clean Architecture**
- **Implementações nativas** (sem frameworks pesados)
- **PostgreSQL + Prisma**
- **JWT nativo**
- **Crypto nativo**
- **HTTP Server nativo**

### 🎯 Objetivos do Projeto

- ✅ **Ultra-leve**: Apenas 3 dependências de produção
- ✅ **Alta Performance**: 135MB RAM, HTTP nativo
- ✅ **Escalável**: Arquitetura limpa e testável
- ✅ **Reutilizável**: Para projetos que precisam de auth de forma leve
- ✅ **Seguro**: JWT + Scrypt + Rate limiting

---

## 🏛️ Arquitetura DDD + Clean Architecture

### 📐 Princípios Aplicados

```mermaid
graph TB
    subgraph "External World"
        HTTP[HTTP Clients]
        DB[(PostgreSQL)]
    end

    subgraph "Infrastructure Layer"
        WEB[HTTP Server]
        REPO[Repositories]
        SEC[Security Services]
    end

    subgraph "Application Layer"
        UC[Use Cases]
        DTO[DTOs]
    end

    subgraph "Domain Layer"
        ENT[Entities]
        VO[Value Objects]
        RULES[Business Rules]
    end

    subgraph "Core Layer"
        EITHER[Either]
        ERROR[Errors]
        EVENTS[Events]
    end

    HTTP --> WEB
    WEB --> UC
    UC --> ENT
    UC --> REPO
    REPO --> DB
    SEC --> UC
```

### 🎭 Inversão de Dependências

```typescript
// ❌ Dependência direta (ruim)
class LoginUseCase {
  private prisma = new PrismaClient(); // Acoplado à infra
}

// ✅ Inversão de dependência (bom)
class LoginUseCase {
  constructor(private userRepository: UserRepository) {} // Interface abstrata
}
```

---

## 📁 Estrutura de Diretórios Atual

```
src/
├── core/                                    # 🔧 Camada Core
│   ├── either.ts                           # Functional Error Handling
│   ├── entity.ts                           # Base Entity Class
│   ├── unique-entity-id.ts                 # ID único para entidades
│   ├── errors/                             # Erros base do sistema
│   │   ├── use-case-error.ts              # Interface base para erros
│   │   └── errors/                        # Erros específicos
│   │       ├── not-allowed-error.ts       # Erro de permissão
│   │       └── resource-not-found-error.ts # Erro de recurso não encontrado
│   └── utils/                              # Utilitários gerais
│
├── domain/                                  # 🏛️ Camada de Domínio
│   ├── auth/                               # Bounded Context: Auth
│   │   ├── enterprise/                     # Regras de negócio
│   │   │   └── entities/                   # Entidades do domínio
│   │   │       ├── user.ts                 # Entidade User
│   │   │       ├── session.ts              # Entidade Session
│   │   │       ├── login-history.ts        # Entidade LoginHistory
│   │   │       └── role.ts                 # Enum Role + Permissions
│   │   └── application/                    # Casos de uso
│   │       └── use-cases/                  # Orquestradores de negócio
│   │           ├── register-user.ts        # Registrar usuário
│   │           ├── login-user.ts           # Fazer login
│   │           └── validate-token.ts       # Validar token
│   └── repositories/                       # Interfaces dos repositórios
│       ├── user-repository.ts              # Interface UserRepository
│       ├── session-repository.ts           # Interface SessionRepository
│       └── login-history-repository.ts     # Interface LoginHistoryRepository
│
├── infra/                                   # 🔧 Camada de Infraestrutura
│   ├── database/                           # Persistência
│   │   └── prisma/                         # Implementação Prisma
│   │       └── repositories/               # Repositórios concretos
│   │           ├── prisma-user-repository.ts
│   │           ├── prisma-session-repository.ts
│   │           └── prisma-login-history-repository.ts
│   ├── http/                               # Camada HTTP
│   │   ├── server.ts                       # HTTP Server nativo
│   │   ├── errors.ts                       # 🆕 Padronização erros HTTP
│   │   ├── make-handler.ts                 # 🆕 Wrapper para tratamento
│   │   ├── dtos/                           # Data Transfer Objects
│   │   │   ├── register-user-dto.ts
│   │   │   └── login-user-dto.ts
│   │   ├── controllers/                    # 🆕 Controllers separados
│   │   │   ├── auth/                       # Controllers de auth
│   │   │   │   ├── register-controller.ts  # 🆕 POST /auth/register
│   │   │   │   ├── login-controller.ts     # 🆕 POST /auth/login
│   │   │   │   └── validate-controller.ts  # 🆕 POST /auth/validate
│   │   │   └── health/                     # 🆕 Controller de health
│   │   │       └── health-controller.ts    # 🆕 GET /health
│   │   └── routes/                         # 🆕 Sistema de rotas
│   │       ├── index.ts                    # 🆕 Registro centralizado
│   │       ├── auth.routes.ts              # 🆕 Rotas de autenticação
│   │       └── health.routes.ts            # 🆕 Rotas de health
│   └── security/                           # Serviços de segurança
│       ├── jwt.ts                          # JWT nativo
│       └── password.ts                     # Scrypt nativo
│
└── main.ts                                  # 🚀 Bootstrap da aplicação
```

### 🔍 Principais Mudanças na Arquitetura

#### 🆕 **Sistema de Rotas Centralizado**
- **`routes/index.ts`**: Ponto único de registro de todas as rotas
- **`routes/auth.routes.ts`**: Rotas específicas de autenticação
- **`routes/health.routes.ts`**: Rotas de health check separadas

#### 🆕 **Controllers Especializados**
- **Um controller por endpoint**: Maior coesão e responsabilidade única
- **`RegisterController`**: Focado apenas no registro de usuários
- **`LoginController`**: Focado apenas no login (com captura de IP)
- **`ValidateController`**: Focado apenas na validação de tokens
- **`HealthController`**: Separado dos controllers de auth

#### 🆕 **Padronização de Erros HTTP**
- **`errors.ts`**: Centraliza mapeamento de erros de domínio → HTTP
- **`make-handler.ts`**: Wrapper para tratamento automático de exceções
- **Separação clara**: Domínio define erros, Infrastructure mapeia para HTTP

```
src/
├── core/                                    # 🧠 Core da aplicação
│   ├── entities/                           # Entidades base
│   │   ├── entity.ts                       # Classe base Entity
│   │   ├── unique-entity-id.ts             # Value Object para IDs
│   │   └── aggregate-root.ts               # Domain Events
│   ├── errors/                             # Sistema de erros
│   │   ├── use-case-error.ts              # Interface de erro
│   │   └── errors/
│   │       ├── not-allowed-error.ts
│   │       └── resource-not-found-error.ts
│   ├── events/                             # Domain Events
│   │   ├── domain-event.ts                # Interface base
│   │   ├── domain-events.ts               # Event Manager
│   │   └── event-handler.ts               # Handler abstrato
│   ├── either.ts                           # Functional Error Handling
│   └── utils/                              # Utilitários gerais
│
├── domain/                                  # 🏛️ Camada de Domínio
│   ├── auth/                               # Bounded Context: Auth
│   │   ├── enterprise/                     # Regras de negócio
│   │   │   └── entities/                   # Entidades do domínio
│   │   │       ├── user.ts                 # Entidade User
│   │   │       ├── session.ts              # Entidade Session
│   │   │       ├── login-history.ts        # Entidade LoginHistory
│   │   │       └── role.ts                 # Enum Role + Permissions
│   │   └── application/                    # Casos de uso
│   │       └── use-cases/                  # Orquestradores de negócio
│   │           ├── register-user.ts        # Registrar usuário
│   │           ├── login-user.ts           # Fazer login
│   │           └── validate-token.ts       # Validar token
│   └── repositories/                       # Interfaces dos repositórios
│       ├── user-repository.ts              # Contrato UserRepository
│       ├── session-repository.ts           # Contrato SessionRepository
│       └── login-history-repository.ts     # Contrato LoginHistoryRepository
│
├── infra/                                   # 🔧 Camada de Infraestrutura
│   ├── database/                           # Persistência de dados
│   │   └── prisma/                         # Implementação Prisma
│   │       └── repositories/               # Implementações concretas
│   │           ├── prisma-user-repository.ts
│   │           ├── prisma-session-repository.ts
│   │           └── prisma-login-history-repository.ts
│   ├── http/                               # Interface HTTP
│   │   ├── server.ts                       # HTTP Server nativo
│   │   ├── controllers/                    # Controllers REST
│   │   │   └── auth-controller.ts          # Endpoints de auth
│   │   └── dtos/                           # Data Transfer Objects
│   │       ├── register-user-dto.ts        # DTO para registro
│   │       └── login-user-dto.ts           # DTO para login
│   └── security/                           # Serviços de segurança
│       ├── jwt.ts                          # JWT nativo
│       └── password.ts                     # Scrypt nativo
│
└── main.ts                                  # 🚀 Bootstrap da aplicação
```

### 🔍 Detalhes por Camada

#### 🧠 **Core Layer**

- **Responsabilidade**: Funcionalidades base compartilhadas
- **Exemplo**: Either<Error, Success>, Entity base class
- **Não depende**: De nenhuma outra camada

#### 🏛️ **Domain Layer**

- **Responsabilidade**: Regras de negócio puras
- **Exemplo**: "Um usuário não pode ter email duplicado"
- **Não depende**: De banco, HTTP, ou frameworks

#### 🎯 **Application Layer**

- **Responsabilidade**: Orquestração dos casos de uso
- **Exemplo**: LoginUserUseCase coordena User + Session + JWT
- **Depende**: Apenas do Domain

#### 🔧 **Infrastructure Layer**

- **Responsabilidade**: Implementações técnicas
- **Exemplo**: PrismaUserRepository, HttpServer
- **Depende**: De todas as outras camadas

---

## 🌐 APIs e Endpoints

### 📋 **Resumo das Rotas**

| Método | Endpoint | Controller | Descrição |
|--------|----------|------------|-----------|
| POST | `/auth/register` | RegisterController | Registrar novo usuário |
| POST | `/auth/login` | LoginController | Fazer login e obter tokens |
| POST | `/auth/validate` | ValidateController | Validar token de acesso |
| GET | `/health` | HealthController | Health check do serviço |

### 🔐 **POST /auth/register**

Registra um novo usuário no sistema.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "minhasenha123",
  "name": "João Silva" // opcional
}
```

**Response Success (201):**
```json
{
  "user": {
    "id": "clx123abc...",
    "email": "user@example.com",
    "name": "João Silva"
  }
}
```

**Response Error (400 - Bad Request):**
```json
{
  "error": "Email and password are required"
}
```

**Response Error (409 - Conflict):**
```json
{
  "error": "User already exists"
}
```

### 🔑 **POST /auth/login**

Faz login e retorna tokens de acesso.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "minhasenha123"
}
```

**Response Success (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clx123abc...",
    "email": "user@example.com",
    "name": "João Silva"
  }
}
```

**Response Error (400 - Bad Request):**
```json
{
  "error": "Email and password are required"
}
```

**Response Error (401 - Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

**Funcionalidades adicionais:**
- ✅ **Captura de IP**: Registra IP do cliente para auditoria
- ✅ **User-Agent**: Registra navegador/dispositivo para segurança
- ✅ **Histórico de login**: Salva tentativas (sucessos e falhas)

### ✅ **POST /auth/validate**

Valida um token de acesso JWT.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response Success (200):**
```json
{
  "valid": true,
  "user": {
    "id": "clx123abc...",
    "email": "user@example.com",
    "name": "João Silva"
  }
}
```

**Response Error (401 - Unauthorized):**
```json
{
  "error": "Authorization token required"
}
```

**Response Error (401 - Invalid Token):**
```json
{
  "error": "Invalid token"
}
```

### 🏥 **GET /health**

Health check do serviço.

**Response Success (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "auth-min"
}
```

### 🔒 **Tratamento de Erros**

Todos os endpoints seguem o padrão de erro unificado:

```typescript
// Mapeamento automático de erros de domínio para HTTP
UserAlreadyExistsError    → 409 Conflict
InvalidCredentialsError   → 401 Unauthorized  
InvalidTokenError         → 401 Unauthorized
ValidationError           → 400 Bad Request
InternalError            → 500 Internal Server Error
```

### 🛡️ **Funcionalidades de Segurança**

#### **JWT Tokens**
- **Access Token**: 15 minutos de duração
- **Refresh Token**: 7 dias de duração
- **Algoritmo**: HMAC-SHA256
- **Implementação**: Nativa (sem dependências)

#### **Password Hashing**
- **Algoritmo**: Scrypt (mais seguro que bcrypt)
- **Salt**: 16 bytes aleatórios
- **Timing-safe**: Previne timing attacks

#### **Auditoria e Monitoramento**
- **IP Tracking**: Captura IP real mesmo atrás de proxies
- **Login History**: Registra todas as tentativas
- **User-Agent**: Identifica dispositivos e navegadores

---

## 🔄 Fluxo de Dados

### 📥 Exemplo: Login de Usuário

```mermaid
sequenceDiagram
    participant Client
    participant Server as HttpServer
    participant Routes as AuthRoutes  
    participant Controller as LoginController
    participant UseCase as LoginUserUseCase
    participant UserRepo as UserRepository
    participant SessionRepo as SessionRepository
    participant DB as PostgreSQL

    Client->>Server: POST /auth/login
    Server->>Routes: Route matching
    Routes->>Controller: loginController.handle()
    
    Controller->>Server: parseBody()
    Controller->>Server: getClientIP()
    
    Controller->>UseCase: execute(dto)
    UseCase->>UserRepo: findByEmail()
    UserRepo->>DB: SELECT user
    DB-->>UserRepo: user data
    UserRepo-->>UseCase: User entity
    
    UseCase->>UseCase: PasswordService.verify()
    UseCase->>UseCase: JwtService.sign()
    
    UseCase->>SessionRepo: save(session)
    SessionRepo->>DB: INSERT session
    
    UseCase-->>Controller: Either.right(tokens)
    Controller->>Server: sendJson(response)
    Server-->>Client: 200 + tokens
```

### 🏗️ Arquitetura Atualizada

```mermaid
graph TB
    subgraph "🌐 HTTP Layer"
        CLIENT[Client Request]
        SERVER[HttpServer]
        ROUTES[Routes System]
    end
    
    subgraph "🎮 Controllers Layer"
        REG_CTRL[RegisterController]
        LOGIN_CTRL[LoginController] 
        VALID_CTRL[ValidateController]
        HEALTH_CTRL[HealthController]
    end
    
    subgraph "🎯 Application Layer"
        REG_UC[RegisterUserUseCase]
        LOGIN_UC[LoginUserUseCase]
        VALID_UC[ValidateTokenUseCase]
    end
    
    subgraph "🏛️ Domain Layer"
        USER[User Entity]
        SESSION[Session Entity]
        ERRORS[Domain Errors]
    end
    
    subgraph "🔧 Infrastructure Layer"
        USER_REPO[UserRepository]
        SESSION_REPO[SessionRepository]
        JWT[JWT Service]
        PWD[Password Service]
        DB[(PostgreSQL)]
    end
    
    CLIENT --> SERVER
    SERVER --> ROUTES
    ROUTES --> REG_CTRL
    ROUTES --> LOGIN_CTRL
    ROUTES --> VALID_CTRL
    ROUTES --> HEALTH_CTRL
    
    REG_CTRL --> REG_UC
    LOGIN_CTRL --> LOGIN_UC
    VALID_CTRL --> VALID_UC
    
    REG_UC --> USER
    LOGIN_UC --> USER
    LOGIN_UC --> SESSION
    VALID_UC --> USER
    
    REG_UC --> USER_REPO
    LOGIN_UC --> USER_REPO
    LOGIN_UC --> SESSION_REPO
    VALID_UC --> USER_REPO
    
    LOGIN_UC --> JWT
    LOGIN_UC --> PWD
    VALID_UC --> JWT
    REG_UC --> PWD
    
    USER_REPO --> DB
    SESSION_REPO --> DB
```

### 🔀 Fluxo de Tratamento de Erros

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant UseCase
    participant ErrorHandler as HttpErrorHandler

    Client->>Controller: POST /auth/login
    Controller->>UseCase: execute(invalidData)
    UseCase-->>Controller: Either.left(InvalidCredentialsError)
    
    Controller->>ErrorHandler: handleDomainError(error)
    ErrorHandler->>ErrorHandler: Map domain error to HTTP
    ErrorHandler-->>Controller: 401 Unauthorized
    Controller-->>Client: { "error": "Invalid credentials" }
```

### 🏗️ **Vantagens da Nova Arquitetura**

#### ✅ **Separação de Responsabilidades**
- **Uma responsabilidade por controller**: Cada endpoint tem seu próprio controller
- **Rotas organizadas**: Sistema centralizado de registro de rotas
- **Erros padronizados**: Mapeamento automático domínio → HTTP

#### ✅ **Manutenibilidade**
- **Facilidade para adicionar novos endpoints**: Basta criar controller + rota
- **Teste independente**: Cada controller pode ser testado isoladamente
- **Evolução gradual**: Modificações não afetam outros endpoints

#### ✅ **Clean Architecture Preservada**
- **Domínio independente**: Erros de negócio ficam no Use Cases
- **Infrastructure mapeia**: Controllers traduzem para HTTP
- **Inversão de dependência**: Abstrações não dependem de detalhes

#### ✅ **Performance e Escalabilidade**
- **HTTP Server nativo**: Sem overhead de frameworks
- **JWT nativo**: Implementação otimizada
- **Captura de IP inteligente**: Suporte a proxies e load balancers


## 🏁 Conclusão

O **Auth-Min** agora está estruturado seguindo as melhores práticas de:

- ✅ **Domain Driven Design (DDD)**: Separação clara entre domínio e infraestrutura
- ✅ **Clean Architecture**: Inversão de dependências respeitada
- ✅ **Performance-first**: HTTP nativo + JWT nativo + Scrypt nativo
- ✅ **Modularidade**: Controllers especializados + sistema de rotas centralizado
- ✅ **Segurança**: Captura de IP + auditoria + erros padronizados

### 🎯 Próximos Passos

1. **Testes**: Unit, Integration e E2E
2. **CI/CD**: Pipeline automatizado  
3. **Monitoramento**: Logs e métricas
4. **Cache**: Redis para sessions
5. **Rate Limiting**: Implementação avançada

---

_Built with ❤️ for ultra-performance services_
