# auth-min — Documentação

Microserviço de autenticação e autorização baseado em NestJS com arquitetura limpa (Clean Architecture / DDD).

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Banco de Dados](#banco-de-dados)
5. [Autenticação e Autorização](#autenticação-e-autorização)
6. [Testes](#testes)
7. [Docker e Infraestrutura](#docker-e-infraestrutura)
8. [Comandos de Referência](#comandos-de-referência)

---

## Visão Geral

O `auth-min` é um microserviço responsável por:

- Criação e gestão de usuários
- Autenticação via JWT com suporte a múltiplos dispositivos
- Controle de acesso baseado em roles e permissões (RBAC)
- Gestão de sessões, refresh tokens e revogação de dispositivos
- Auditoria de ações via logs estruturados (Winston)

**Stack principal:**

| Categoria | Tecnologia |
|-----------|-----------|
| Framework | NestJS 10 |
| Linguagem | TypeScript 5 |
| ORM | Prisma 7 + adapter-pg |
| Banco | PostgreSQL 15 |
| Auth | JWT + Passport + Bcrypt |
| Validação | Zod + class-validator |
| Logs | Winston + nest-winston |
| Testes | Vitest + SWC + Supertest |
| Package manager | pnpm |
| CI | GitHub Actions |

---

## Arquitetura

O projeto segue Clean Architecture com DDD, organizado em três camadas:

```
┌─────────────────────────────────────┐
│           Infrastructure            │  Controllers, Prisma, JWT, Guards
├─────────────────────────────────────┤
│            Application              │  Use Cases (casos de uso)
├─────────────────────────────────────┤
│              Domain                 │  Entidades, Repositórios (interfaces)
├─────────────────────────────────────┤
│               Core                  │  Either, Errors, abstrações base
└─────────────────────────────────────┘
```

**Padrões utilizados:**
- **Either pattern** para tratamento de erros sem exceções
- **Repository pattern** com interfaces no domínio e implementações na infra
- **Use Cases** isolados, testáveis e sem dependência de framework
- **In-memory repositories** para testes unitários
- **Factories** para criação de entidades nos testes

---

## Estrutura de Pastas

```
auth-min/
├── src/
│   ├── core/                        # Abstrações base (Either, errors)
│   ├── domain/
│   │   └── auth/
│   │       ├── enterprise/          # Entidades de domínio
│   │       │   └── entities/        # User, Role, Permission, Device, etc.
│   │       └── application/
│   │           ├── use-cases/       # Casos de uso (lógica de negócio)
│   │           ├── repositories/    # Interfaces dos repositórios
│   │           └── cryptography/    # Interfaces de criptografia
│   ├── infra/
│   │   ├── auth/                    # JWT Strategy, Guards, Decorators
│   │   ├── cryptography/            # Bcrypt, JWT, AES (implementações)
│   │   ├── database/
│   │   │   └── prisma/
│   │   │       ├── repositories/    # Implementações Prisma dos repositórios
│   │   │       └── mappers/         # Mapeamento Prisma ↔ Domínio
│   │   ├── env/                     # Validação de variáveis de ambiente
│   │   ├── http/
│   │   │   └── controllers/auth/    # Controllers HTTP
│   │   └── logging/                 # Interceptors de log
│   ├── generated/
│   │   └── prisma/                  # Cliente Prisma (auto-gerado, git-ignored)
│   ├── app.module.ts
│   └── main.ts
├── test/
│   ├── e2e/                         # Testes end-to-end
│   ├── helpers/                     # TestAppHelper, DatabaseHelper, etc.
│   ├── repositories/                # Repositórios in-memory
│   ├── factories/                   # Factories de entidades
│   ├── cryptography/                # Fakes de criptografia
│   └── setup-e2e.ts                 # Setup E2E: carrega .env.test + prisma db push
├── prisma/
│   └── schema.prisma                # Schema principal
├── .github/
│   └── workflows/
│       └── ci.yml                   # Pipeline GitHub Actions
├── docker-compose.yml               # App + Postgres (produção/dev)
├── docker-compose.test.yml          # Postgres de teste
├── .env                             # Variáveis de produção
├── .env.test                        # Variáveis de teste
└── pnpm-lock.yaml
```

---

## Banco de Dados

### Modelos principais

| Modelo | Descrição |
|--------|-----------|
| `User` | Usuário com email único, senha (bcrypt), status e histórico |
| `Role` | Papel com nível hierárquico e roles atribuíveis |
| `Permission` | Permissão no padrão `resource:action` |
| `UserRole` | Relação usuário ↔ role |
| `RolePermission` | Relação role ↔ permission |
| `Device` | Dispositivo do usuário (OS, browser, IP, localização) |
| `RefreshToken` | Token de longa duração para renovar sessão |
| `AccessToken` | JWT de curta duração |
| `LoginHistory` | Histórico de logins |
| `AuditLog` | Auditoria completa de ações |

### Schema único

| Localização | Output | Banco dev | Banco teste |
|-------------|--------|-----------|-------------|
| `prisma/schema.prisma` | `src/generated/prisma` | `auth_db` (porta 8238) | `auth_test_db` (porta 8239) |

---

## Autenticação e Autorização

### Fluxo de autenticação

```
POST /auth/user      → Criar usuário
POST /login          → Autenticar dispositivo → recebe accessToken + refreshToken
POST /refresh        → Renovar accessToken via refreshToken
DELETE /logout/:id   → Revogar todos os dispositivos do usuário
DELETE /revoke-device-session → Revogar dispositivo específico
```

### Controle de acesso

```typescript
@RequirePermission('roles', 'assign')  // permissão específica
@RequireRole('admin')                   // role específico
@UseGuards(JwtAuthGuard, PermissionsGuard)
```

### Use cases disponíveis (22)

| Use Case | Descrição |
|----------|-----------|
| `CreateUserUseCase` | Criação de usuário com hash de senha |
| `AuthenticateDeviceUseCase` | Login com rastreamento de dispositivo |
| `RefreshAccessTokenUseCase` | Renovação de token |
| `ValidateTokenUseCase` | Validação de JWT |
| `RevokeDeviceSessionUseCase` | Revogar sessão de dispositivo |
| `RevokeUserDeviceUseCase` | Revogar dispositivo do usuário |
| `RevokeAllDevicesUseCase` | Revogar todos os dispositivos |
| `CreateRoleUseCase` | Criar role |
| `ListRolesUseCase` | Listar roles |
| `AssignRoleToUserUseCase` | Atribuir role a usuário |
| `RemoveRoleFromUserUseCase` | Remover role de usuário |
| `CreatePermissionUseCase` | Criar permissão |
| `ListPermissionsUseCase` | Listar permissões |
| `CheckUserPermissionUseCase` | Verificar permissão de usuário |
| `GetUserByIdUseCase` | Buscar usuário por ID |
| `DeleteUserUseCase` | Deletar usuário |

---

## Testes

### Tipos de teste

| Tipo | Localização | Comando | Descrição |
|------|-------------|---------|-----------|
| Unitário | `src/**/tests/*.spec.ts` | `pnpm test` | Testa use cases isolados com repositórios in-memory |
| E2E | `test/e2e/*.e2e-spec.ts` | `pnpm test:e2e` | Testa endpoints HTTP contra banco de teste real |

### Estratégia de testes unitários

- Repositórios substituídos por implementações **in-memory**
- Criptografia substituída por **fakes** determinísticos
- Entidades criadas via **factories**
- Sem dependência de banco ou framework

### Estratégia de testes e2e

- NestJS sobe em memória via `@nestjs/testing`
- Banco de teste real (PostgreSQL na porta 8239)
- `setup-e2e.ts` carrega `.env.test` e executa `prisma db push` para sincronizar o schema
- Cleanup automático entre testes via `DatabaseHelper.cleanup()` + `seed()`

### Cobertura atual

- **16 suites unitárias → 59 testes**
- **1 suite e2e → 22 testes**

---

## Docker e Infraestrutura

### Bancos de dados

| Compose | Serviço | Porta | Uso |
|---------|---------|-------|-----|
| `docker-compose.yml` | `postgres` | 8238 | Desenvolvimento/produção |
| `docker-compose.test.yml` | `postgres-test` | 8239 | Testes locais |

---

## Comandos de Referência

### Desenvolvimento local

```bash
# subir banco de desenvolvimento
docker compose up -d

# iniciar aplicação com hot reload
pnpm dev

# gerar cliente Prisma após mudar o schema
pnpm prisma:generate

# aplicar migrations
pnpm prisma:migrate

# abrir Prisma Studio
pnpm prisma:studio

# popular banco com seed
pnpm db:seed
```

### Testes locais

```bash
# subir banco de teste (necessário para e2e)
docker compose -f docker-compose.test.yml up -d

# rodar testes unitários
pnpm test

# rodar testes unitários em watch mode
pnpm test:watch

# rodar testes unitários com cobertura
pnpm test:coverage

# rodar testes e2e
pnpm test:e2e

# rodar testes e2e em watch mode
pnpm test:e2e:watch

# rodar todos os testes
pnpm test:all
```

### Qualidade de código

```bash
# verificar lint
pnpm lint:check

# corrigir lint automaticamente
pnpm lint

# verificar formatação
pnpm format:check

# formatar código
pnpm format
```

### Build e produção

```bash
# compilar TypeScript
pnpm build

# iniciar aplicação compilada
pnpm start:prod
```

### Instalação do zero

```bash
# instalar dependências
pnpm install

# gerar cliente Prisma
pnpm prisma:generate

# subir bancos
docker compose up -d
docker compose -f docker-compose.test.yml up -d

# iniciar
pnpm dev
```
