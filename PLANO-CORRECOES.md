# Plano de Correções — auth-min (repo novo)

> Base para começar o repositório novo com as decisões já tomadas.
> Objetivo: eliminar código/estrutura morta, corrigir a lógica de tokens,
> uniformizar integridade referencial e limpar o schema.

## Status: ✅ EXECUTADO (2026-07-20)

Todas as fases funcionais foram aplicadas. Verificação final:
**81 testes passando** (59 unit + 22 e2e), build limpo, type-check limpo, lint OK,
migration `init` recriada e aplicada.

Pendências **de ambiente** (não de código), a resolver na máquina de dev:
- `pnpm install` não roda aqui (corepack/pnpm incompatível com o Node local).
  Os testes rodam via `node_modules/.bin/vitest` no **Node 20** (`nvm use`).
- `@vitest/coverage-v8` está declarado no `package.json` mas precisa de `pnpm install`.
- O binário nativo do `bcrypt` foi reconstruído para o Node 20
  (`node-pre-gyp install --update-binary`); refazer após qualquer troca de Node.

## Decisões (definidas com o time)

| Tema | Decisão |
|---|---|
| Tabelas não usadas | **Remover** `AuditLog`, `AccessToken`, `LoginHistory` |
| Deleção de usuário | **Soft-delete** no `User` (`deletedAt`), sessões/tokens revogados junto |
| Refresh token | **Rotação + detecção de reuso** (OWASP) |
| Limpeza de schema | **Completa**: `revokedAt` único, sem índices duplicados, relações camelCase |

---

## Fase 0 — Toolchain (bloqueante)

O ambiente atual quebra com Node 22.6.0 (`ERR_REQUIRE_ESM` em vite 7 / prisma dev).

- [ ] Adicionar `.nvmrc` com `20` (ou `22.12`).
- [ ] Adicionar `engines` no `package.json`: `"node": ">=20.19 <21 || >=22.12"`.
- [ ] Instalar provider de cobertura: `@vitest/coverage-v8` (dev).
- [ ] Corrigir pnpm/corepack (erro de assinatura `Cannot find matching keyid`) — atualizar corepack ou fixar versão do pnpm no `packageManager`.

**Verificação:** `nvm use`, `pnpm prisma:generate`, `pnpm test` verdes.

---

## Fase 1 — Schema Prisma (fundação)

Arquivo: `prisma/schema.prisma`. Recomeçar com **uma migration limpa** (`init`), descartando o histórico com dois `init` atuais.

### 1.1 Remover tabelas mortas
- [ ] Remover model `AuditLog` (+ relações `AuditLogs`/`PerformedAudits` em `User`).
- [ ] Remover model `AccessToken` (+ relação `AccessTokens` em `User`).
- [ ] Remover model `LoginHistory` (+ relação `LoginHistory` em `User`).

### 1.2 Soft-delete no User
- [ ] Adicionar `deletedAt DateTime?` em `User`.
- [ ] Manter `isActive` como flag de bloqueio (distinto de deleção).
- [ ] `@@index([deletedAt])` para filtrar ativos com eficiência.

### 1.3 RefreshToken — fonte única de revogação
- [ ] Remover o boolean `revoked`. Manter apenas `revokedAt DateTime?`.
- [ ] `revoked` passa a ser derivado no domínio (`revokedAt != null`).
- [ ] Adicionar suporte à rotação (ver Fase 3):
  - `replacedByTokenId String?` (aponta para o token que o sucedeu) **ou**
  - `familyId String` (identifica a cadeia/sessão para revogação em massa).
  - Decisão de implementação: usar `familyId` (mais simples para "nuke" da sessão no reuso).
- [ ] `@@index([familyId])`.

### 1.4 Integridade referencial (onDelete)
- [ ] `RefreshToken.device` → `onDelete: Cascade` (hoje está `Restrict` implícito).
- [ ] Confirmar `RefreshToken.user` e `Device.user` → `Cascade`.
- [ ] Como o User é soft-delete, o cascade só dispara em hard-delete administrativo — manter consistente mesmo assim.

### 1.5 Índices duplicados
Remover `@@index` redundante em campos que já são `@unique` (o unique já cria btree):
- [ ] `User.email` — remover `@@index([email])`.
- [ ] `RefreshToken.token` — remover `@@index([token])`.
- [ ] `Role.slug` — remover `@@index([slug])`.
- [ ] `Permission.slug` — remover `@@index([slug])`.

### 1.6 Naming das relações (camelCase idiomático)
- [ ] `User.RefreshTokens` → `refreshTokens`, `Devices` → `devices`, `Roles` → `roles`, etc.
- [ ] `RefreshToken.User/Device` → `user`/`device`.
- [ ] Ajustar todos os mappers/repos que referenciam esses nomes.

### 1.7 Device — campos externos opcionais
- [ ] Tornar opcionais os campos dependentes de geo-IP/UA: `location`, `browser`, `operatingSystem` → `String?`.
- [ ] Manter obrigatórios: `name`, `type`, `ipAddress`, `lastLogin`.

**Entregável:** schema revisado + `prisma migrate dev --name init` limpo.

---

## Fase 2 — Domínio: entidades e mappers

### 2.1 RefreshToken (`enterprise/entities/refresh-token.ts`)
- [ ] Trocar prop `revoked: boolean` por `revokedAt?: Date`.
- [ ] `get revoked()` derivado: `return !!this.props.revokedAt`.
- [ ] `revoke()`: setar apenas `revokedAt = new Date()`.
- [ ] Adicionar `familyId` às props.

### 2.2 Mapper (`mappers/prisma-refresh-token-mapper.ts`)
- [ ] **Bug atual**: `toDomain` lê `revoked` e ignora `revokedAt`. Corrigir para mapear `revokedAt` (fonte única).
- [ ] `toPrisma` não deve mais escrever `revoked`.
- [ ] `save` no repo usa `toPrisma` com `connect` de relações (input de create) — trocar por um shape de update sem reconectar relações a cada save.

### 2.3 Remover entidades órfãs
- [ ] Remover entidade `AccessToken` (`enterprise/entities/access-token.ts`) e `access-token-presenter.ts`.
- [ ] Remover entidade `LoginHistory` e `login-history-repository.ts` (interface).
- [ ] Buscar e limpar imports quebrados: `grep -rn "AccessToken\|LoginHistory" src`.

---

## Fase 3 — Fluxo de refresh token (rotação + reuso)

Arquivo: `use-cases/refresh-access-token.ts`. Reescrever a lógica:

1. [ ] Buscar `refreshToken` por valor.
2. [ ] Se **não existe** → `RefreshTokenNotFoundError`.
3. [ ] Se **expirado** → `RefreshTokenExpiredError`.
4. [ ] Se **revogado** (reuso detectado!) → revogar **toda a família** (`familyId`) e retornar erro específico `RefreshTokenReuseError` (novo). Força re-login.
5. [ ] Se válido:
   - Revogar o token atual (`revoke()` + `save`).
   - Criar **novo** refresh token no mesmo `familyId`, persistir.
   - Gerar novo access token via `encrypter`.
   - Retornar `{ accessToken, refreshToken: novoToken }`.

Remover:
- [ ] O `AccessToken.create(...)` descartado (linhas ~64-70 hoje).
- [ ] O `save` inútil sobre a entidade não-mutada (hoje linha ~72).
- [ ] Corrigir o erro enganoso (revogado retornando "expired").

### 3.1 authenticate-device
- [ ] Ao criar sessão, gerar `familyId` novo para o primeiro refresh token.

### 3.2 Centralizar TTLs
- [ ] Mover `900*1000`, `1 dia`, `7 dias` para `infra/env` (ex.: `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL`).
- [ ] Consumir via config, não hardcoded nos use cases.

**Testes:** cenários novos — refresh feliz com rotação; reuso de token revogado derruba a família; expirado; inexistente.

---

## Fase 4 — Soft-delete do usuário

### 4.1 delete-user (`use-cases/delete-user.ts`)
- [ ] Em vez de `repository.delete(userId)`, setar `deletedAt` (novo método `softDelete` ou `save` com a flag).
- [ ] Revogar todos os refresh tokens do usuário e desativar todos os devices (`active = false`) na mesma operação.
- [ ] Idempotência: deletar usuário já deletado → erro claro ou no-op.

### 4.2 Repositórios (`users-repository`)
- [ ] `findById` / `findByEmail` / listagens: filtrar `deletedAt = null` por padrão.
- [ ] Manter um método explícito para incluir deletados quando necessário (admin).

### 4.3 In-memory repos (test/repositories)
- [ ] Espelhar o filtro de soft-delete para os testes unitários continuarem fiéis.

**Testes:** usuário deletado não aparece em busca/login; tokens e devices revogados; email de deletado — decidir se libera reuso (recomendado: manter `@unique` e não liberar, ou usar unique parcial `WHERE deletedAt IS NULL`).

---

## Fase 5 — Limpeza de wiring e verificação

- [ ] Remover registros dos use cases/controllers/repos deletados em `http.module.ts` e no module de database.
- [ ] `pnpm lint` + `pnpm build` sem erros de import órfão.
- [ ] `pnpm test` (unit) verde, com os novos cenários.
- [ ] `pnpm test:e2e` — atualizar/ampliar E2E: refresh com rotação, soft-delete, e as rotas ainda sem cobertura (roles/permissions).
- [ ] `pnpm test:coverage` rodando (provider instalado na Fase 0).

---

## Ordem de execução sugerida

```
Fase 0  (toolchain)      ──► desbloqueia tudo
Fase 1  (schema)         ──► fundação; gera nova migration
Fase 2  (entidades/map)  ──► alinha domínio ao schema
Fase 3  (refresh token)  ──► lógica nova + testes
Fase 4  (soft-delete)    ──► lógica nova + testes
Fase 5  (wiring/verif.)  ──► fecha o ciclo
```

## Pontos de atenção / decisões pendentes menores

- **Unique de email com soft-delete**: se quiser permitir recadastro do mesmo email após deleção, trocar `@unique` por índice único parcial (`WHERE deletedAt IS NULL`). Decisão default: **manter `@unique` simples** (não reaproveita email).
- **familyId vs replacedByTokenId**: plano assume `familyId`. Se preferir rastrear a cadeia explícita, trocar por `replacedByTokenId`.
- **AuditLog**: removido agora. Se auditoria virar requisito, reintroduzir como feature completa (tabela + repo + gravação nos fluxos), não como tabela fantasma.
