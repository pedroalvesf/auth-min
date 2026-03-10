# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Auth-min is a NestJS authentication & authorization microservice using Clean Architecture + DDD. It handles JWT auth, RBAC with hierarchical roles, device-based session tracking, and audit logging. Written in TypeScript with Prisma + PostgreSQL.

## Commands

```bash
# Development
pnpm dev                # Start with hot reload (port 3000)
pnpm build              # Compile TypeScript (nest build --tsc)

# Testing (Vitest + SWC)
pnpm test               # Unit tests (vitest run --project unit)
pnpm test:watch         # Unit tests watch mode
pnpm test:coverage      # Unit tests with coverage
pnpm test:e2e           # E2E tests (needs postgres on port 8239, see E2E setup below)
pnpm test:all           # All tests

# Code quality
pnpm lint:check         # ESLint check
pnpm lint               # ESLint fix
pnpm format:check       # Prettier check
pnpm format             # Prettier fix

# Database
pnpm prisma:generate    # Generate Prisma client (required before tests/build)
pnpm prisma:migrate     # Run migrations
docker compose -f docker-compose.test.yml up -d  # Start test DB
```

## Architecture

```
src/
├── core/               # Shared kernel: Entity, Either<L,R>, UniqueEntityID, WatchedList, DomainEvents
├── domain/auth/
│   ├── enterprise/entities/    # Domain entities (User, Role, Permission, Device, RefreshToken, etc.)
│   └── application/
│       ├── use-cases/          # 16 use cases, each with tests/ subfolder
│       ├── repositories/       # Abstract repository interfaces
│       └── cryptography/       # Abstract crypto interfaces (HashGenerator, Encrypter, etc.)
├── infra/
│   ├── auth/           # JWT strategy, guards (Jwt, Roles, Permissions), decorators (@Public, @CurrentUser)
│   ├── cryptography/   # Bcrypt, JWT, AES implementations
│   ├── database/prisma/  # Prisma repository implementations + mappers
│   ├── http/controllers/ # NestJS controllers + DTOs + presenters
│   ├── env/            # Zod-based env validation
│   └── logging/        # Winston integration
└── generated/prisma/   # Auto-generated Prisma client (git-ignored)

test/
├── repositories/       # In-memory repository implementations
├── factories/          # Entity factories (makeUser, makeRole, makeDevice, etc.)
├── cryptography/       # Fake implementations (FakeEncrypter, FakeHashComparer)
├── helpers/            # TestAppHelper, DatabaseHelper, AuthHelper
├── e2e/                # E2E specs using supertest
└── setup-e2e.ts        # E2E setup: loads .env.test + runs prisma db push
```

**Dependency flow**: Controllers -> Use Cases -> Repository interfaces <- Prisma implementations

## Key Patterns

**Either pattern** (`src/core/either.ts`): Use cases return `Either<ErrorType, { result }>` instead of throwing. `left()` = error, `right()` = success. Controllers check `result.isLeft()` and map to HTTP errors.

**Repository pattern**: Use cases depend on abstract classes (e.g., `UsersRepository`). NestJS DI binds them to Prisma implementations in `DatabaseModule`. Tests use in-memory implementations from `test/repositories/`.

**WatchedList**: Tracks collection mutations (new/removed items) on aggregate roots like User's RoleList. Used for efficient persistence of relation changes.

**Mappers** (`infra/database/prisma/mappers/`): Convert between Prisma raw objects and domain entities. Every repository has a corresponding mapper.

## Testing Conventions

- Unit tests: `src/**/*.spec.ts` — use in-memory repos + fake crypto, no DB needed
- E2E tests: `test/**/*.e2e-spec.ts` — real PostgreSQL, `setup-e2e.ts` runs `prisma db push` before tests, `DatabaseHelper.cleanup()`/`seed()` resets data between tests
- Factory functions: `makeUser()`, `makeRole()`, `makeDevice()`, etc. accept `Partial<Props>` overrides
- Use `vi.fn()` for mocks (Vitest, not Jest)
- Test config: `vitest.config.ts` with two projects (`unit` and `e2e`)

## Path Aliases

`@/*` -> `src/*`, `@/core/*` -> `src/core/*`, `@/domain/*` -> `src/domain/*`, `@/infra/*` -> `src/infra/*`, `@/test/*` -> `test/*`

## Adding a New Use Case

1. Create use case in `src/domain/auth/application/use-cases/`
2. Add error types in `use-cases/errors/` if needed
3. Write unit test in `use-cases/tests/*.spec.ts` using in-memory repos
4. Create controller in `src/infra/http/controllers/auth/`
5. Create DTO in `src/infra/http/controllers/dto/`
6. Register use case + controller in `src/infra/http/http.module.ts`
