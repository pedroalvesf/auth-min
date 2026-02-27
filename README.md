# Auth-Min

Authentication and authorization microservice built with **NestJS** + **DDD** + **Clean Architecture**.

## Features

- **JWT Authentication** with access and refresh token management
- **Device-based sessions** with tracking and per-device revocation
- **Role-Based Access Control (RBAC)** with hierarchical roles
- **Permission system** with resource/action granularity
- **Clean Architecture** with domain, application, and infrastructure layers
- **Either pattern** for typed error handling
- **Repository pattern** for data access abstraction

## Architecture

```
src/
  core/           # Shared kernel (Entity, AggregateRoot, ValueObjects, Either)
  domain/auth/
    enterprise/   # Domain entities (User, Role, Permission, Device, Token)
    application/  # Use cases, repository interfaces, cryptography interfaces
  infra/
    auth/         # JWT strategy, guards (auth, permissions, roles)
    cryptography/ # Bcrypt, JWT, AES implementations
    database/     # Prisma repositories and mappers
    http/         # NestJS controllers, DTOs, presenters
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- Docker & Docker Compose

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd auth-min
pnpm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start Database

```bash
docker compose up -d
```

### 4. Run Migrations

```bash
pnpm prisma:migrate
```

### 5. Seed Database (Optional)

```bash
pnpm db:seed
```

This creates roles, permissions, and test users. See `prisma/permissions.config.ts` to customize.

Test credentials:
- `superadmin@authmin.com` / `senha123` (full access)
- `admin@authmin.com` / `senha123` (admin access)
- `manager@authmin.com` / `senha123` (manager access)
- `user@authmin.com` / `senha123` (read-only access)

### 6. Development

```bash
pnpm dev
# Server running on http://localhost:3000
```

## API Endpoints

### Authentication

| Method | Endpoint                  | Auth | Description                      |
| ------ | ------------------------- | ---- | -------------------------------- |
| POST   | `/auth/user`              | No   | Create user and auto-login       |
| DELETE | `/auth/user/:id`          | Yes  | Delete user (requires `users:delete`) |
| POST   | `/login`                  | No   | Authenticate with device headers |
| POST   | `/logout/:userId`         | Yes  | Revoke all device sessions       |
| DELETE | `/revoke-device-session`  | Yes  | Revoke a specific device session |

### Roles

| Method | Endpoint         | Auth | Description                           |
| ------ | ---------------- | ---- | ------------------------------------- |
| GET    | `/roles`         | Yes  | List all roles (requires `roles:read`) |
| POST   | `/roles`         | Yes  | Create role (requires `roles:create`) |
| POST   | `/roles/assign`  | Yes  | Assign role to user                   |
| DELETE | `/roles/remove`  | Yes  | Remove role from user                 |

### Permissions

| Method | Endpoint       | Auth | Description                                    |
| ------ | -------------- | ---- | ---------------------------------------------- |
| GET    | `/permissions` | Yes  | List permissions (requires `permissions:read`) |
| POST   | `/permissions` | Yes  | Create permission                              |

## Testing

### Unit Tests

```bash
pnpm test
```

### E2E Tests

Requires a running test database:

```bash
# Setup test database
pnpm db:setup:test

# Run e2e tests
pnpm test:e2e
```

### All Tests

```bash
pnpm test:all
```

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (HS256) with refresh tokens
- **Password Hashing**: Bcrypt
- **Validation**: Zod + class-validator
- **Logging**: Winston
- **Container**: Docker
- **Package Manager**: pnpm
- **CI**: GitHub Actions

## License

MIT License - see [LICENSE](LICENSE) file for details.
