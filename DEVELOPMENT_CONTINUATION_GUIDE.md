# 📋 Guia de Continuidade do Desenvolvimento - Testes Unitários

## 🎯 **Estado Atual do Projeto**

**Data da Parada:** Outubro 2025  
**Progresso:** 11/16 casos de uso testados (68% completo)  
**Total de Testes:** 35 testes passando  
**Cobertura:** Casos de uso principais do domínio de autenticação

---

## 📊 **Status dos Testes por Caso de Uso**

### ✅ **CONCLUÍDOS (11 casos de uso)**

| Caso de Uso             | Arquivo de Teste                | Testes | Status |
| ----------------------- | ------------------------------- | ------ | ------ |
| `assign-role-to-user`   | `assign-role-to-user.spec.ts`   | 3      | ✅     |
| `authenticate-device`   | `authenticate-device.spec.ts`   | 5      | ✅     |
| `check-user-permission` | `check-user-permission.spec.ts` | 5      | ✅     |
| `create-permission`     | `create-permission.spec.ts`     | 3      | ✅     |
| `create-role`           | `create-role.spec.ts`           | 4      | ✅     |
| `create-user`           | `create-user.spec.ts`           | 2      | ✅     |
| `delete-user`           | `delete-user.spec.ts`           | 3      | ✅     |
| `get-user-by-id`        | `get-user-by-id.spec.ts`        | 2      | ✅     |
| `list-permissions`      | `list-permissions.spec.ts`      | 2      | ✅     |
| `list-roles`            | `list-roles.spec.ts`            | 2      | ✅     |
| `remove-role-from-user` | `remove-role-from-user.spec.ts` | 4      | ✅     |

### ❌ **PENDENTES (5 casos de uso)**

| Caso de Uso             | Complexidade | Prioridade | Descrição                                 |
| ----------------------- | ------------ | ---------- | ----------------------------------------- |
| `refresh-access-token`  | 🟡 Média     | Alta       | Renovação de tokens de acesso             |
| `revoke-all-devices`    | 🟡 Média     | Alta       | Revogar todos os dispositivos do usuário  |
| `revoke-device-session` | 🟡 Média     | Média      | Revogar sessão de dispositivo específico  |
| `revoke-user-device`    | 🟡 Média     | Média      | Revogar dispositivo específico do usuário |
| `validate-token`        | 🟢 Baixa     | Baixa      | Validação de tokens                       |

---

## 🏗️ **Estrutura de Pastas e Arquitetura**

### **Estrutura Atual dos Testes**

```
test/
├── factories/                    # 🏭 Factories para criação de entidades
│   ├── make-user.ts             # ✅ User factory
│   ├── make-role.ts             # ✅ Role factory
│   ├── make-permission.ts       # ✅ Permission factory
│   └── make-device.ts           # ✅ Device factory
│
├── repositories/                 # 🗄️ Repositórios in-memory para testes
│   ├── in-memory-users-repository.ts        # ✅ User repository
│   ├── in-memory-roles-repository.ts        # ✅ Role repository
│   ├── in-memory-permissions-repository.ts  # ✅ Permission repository
│   ├── in-memory-devices-repository.ts      # ✅ Device repository
│   └── in-memory-refresh-token-repository.ts # ✅ RefreshToken repository
│
├── cryptography/               # 🔐 Mocks para serviços de criptografia
│   ├── fake-hash-comparer.ts   # ✅ Hash comparison mock
│   └── fake-encrypter.ts       # ✅ Encryption mock
│
├── helpers/                    # 🛠️ Helpers para reduzir duplicação
│   └── setup-user-role-permission.ts # ✅ Setup relationships
│
└── setup.ts                   # ⚙️ Configuração global dos testes
```

### **Testes dos Casos de Uso**

```
src/domain/auth/application/use-cases/tests/
├── assign-role-to-user.spec.ts       # ✅
├── authenticate-device.spec.ts       # ✅
├── check-user-permission.spec.ts     # ✅
├── create-permission.spec.ts         # ✅
├── create-role.spec.ts               # ✅
├── create-user.spec.ts               # ✅
├── delete-user.spec.ts               # ✅
├── get-user-by-id.spec.ts            # ✅
├── list-permissions.spec.ts          # ✅
├── list-roles.spec.ts                # ✅
├── remove-role-from-user.spec.ts     # ✅
│
└── 🚧 PENDENTES:
    ├── refresh-access-token.spec.ts      # ❌ TODO
    ├── revoke-all-devices.spec.ts        # ❌ TODO
    ├── revoke-device-session.spec.ts     # ❌ TODO
    ├── revoke-user-device.spec.ts        # ❌ TODO
    └── validate-token.spec.ts            # ❌ TODO
```

---

## 🎯 **Metodologia de Desenvolvimento**

### **1. Abordagem de Testes**

- **Testes Unitários Puros**: Testamos apenas a lógica de negócio dos casos de uso
- **Repositórios In-Memory**: Simulam persistência sem dependências externas
- **Mocks Simples**: Para serviços de criptografia e outras dependências
- **Factories Determinísticas**: Dados previsíveis sem bibliotecas como Faker

### **2. Padrão de Estrutura dos Testes**

#### **Template Padrão:**

```typescript
import { InMemory[Entity]Repository } from "@/test/repositories/in-memory-[entity]-repository";
import { make[Entity] } from "@/test/factories/make-[entity]";
import { [UseCase]UseCase } from "../[use-case]";
import { [ExpectedError] } from "../errors/[expected-error]";

let [entity]Repository: InMemory[Entity]Repository;
let sut: [UseCase]UseCase; // sut = System Under Test

describe("[Use Case Name]", () => {
  beforeEach(() => {
    [entity]Repository = new InMemory[Entity]Repository();
    sut = new [UseCase]UseCase([entity]Repository);
  });

  it("should be able to [happy path scenario]", async () => {
    // Arrange
    const entity = make[Entity]();
    await [entity]Repository.create(entity);

    // Act
    const result = await sut.execute({ /* params */ });

    // Assert
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toMatchObject({ /* expected result */ });
    }
  });

  it("should not be able to [error scenario]", async () => {
    // Arrange & Act
    const result = await sut.execute({ /* invalid params */ });

    // Assert
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf([ExpectedError]);
  });
});
```

### **3. Convenções Estabelecidas**

#### **Nomenclatura:**

- **Factories**: `make[Entity](override?, id?)` - ex: `makeUser()`, `makeRole()`
- **Repositories**: `InMemory[Entity]Repository` - ex: `InMemoryUsersRepository`
- **Mocks**: `Fake[Service]` - ex: `FakeHashComparer`, `FakeEncrypter`
- **Helpers**: Descritivos - ex: `setupUserRoleRelationship()`

#### **Estrutura de Teste:**

- **Arrange**: Preparar dados e dependências
- **Act**: Executar o caso de uso
- **Assert**: Verificar resultados e efeitos colaterais

#### **Cenários Obrigatórios:**

1. **Happy Path**: Caso de sucesso principal
2. **Error Cases**: Todos os cenários de erro possíveis
3. **Edge Cases**: Casos limites e validações específicas
4. **Side Effects**: Verificar efeitos colaterais (criação, atualização, etc.)

---

## 🚀 **Plano de Continuidade**

### **Próximos Passos (em ordem de prioridade):**

#### **1. `refresh-access-token.spec.ts`** 🔴 ALTA PRIORIDADE

- **Cenários a testar:**
  - ✅ Renovar token com refresh token válido
  - ❌ Falhar com refresh token expirado
  - ❌ Falhar com refresh token inexistente
  - ❌ Falhar com refresh token revogado
  - ✅ Atualizar último acesso do dispositivo

#### **2. `revoke-all-devices.spec.ts`** 🔴 ALTA PRIORIDADE

- **Cenários a testar:**
  - ✅ Revogar todos os dispositivos do usuário
  - ✅ Revogar todos os refresh tokens do usuário
  - ❌ Falhar com usuário inexistente
  - ✅ Não falhar quando usuário não tem dispositivos

#### **3. `revoke-device-session.spec.ts`** 🟡 MÉDIA PRIORIDADE

- **Cenários a testar:**
  - ✅ Revogar sessão de dispositivo específico
  - ✅ Revogar refresh tokens do dispositivo
  - ❌ Falhar com dispositivo inexistente
  - ❌ Falhar quando usuário não é dono do dispositivo

#### **4. `revoke-user-device.spec.ts`** 🟡 MÉDIA PRIORIDADE

- **Cenários a testar:**
  - ✅ Revogar dispositivo específico do usuário
  - ✅ Revogar refresh tokens associados
  - ❌ Falhar com usuário inexistente
  - ❌ Falhar com dispositivo inexistente

#### **5. `validate-token.spec.ts`** 🟢 BAIXA PRIORIDADE

- **Cenários a testar:**
  - ✅ Validar token válido
  - ❌ Falhar com token inválido
  - ❌ Falhar com token expirado
  - ❌ Falhar com token malformado

---

## 🛠️ **Ferramentas e Dependências Removidas**

### **❌ Removidas:**

- `@faker-js/faker` - Substituído por dados determinísticos
- Arquivos `.js` compilados na pasta `test/` - Mantemos apenas TypeScript

### **✅ Mantidas:**

- `jest` + `ts-jest` - Framework de testes
- Repositórios in-memory próprios
- Mocks personalizados para serviços

---

## 🧪 **Comandos de Teste**

```bash
# Executar todos os testes
npm test

# Executar teste específico
npm test -- src/domain/auth/application/use-cases/tests/[nome-do-teste].spec.ts

# Executar testes com watch mode
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

---

## 📝 **Notas Importantes para Continuidade**

### **1. Configurações Atuais:**

- `tsconfig.json` configurado com paths para `@/` e `@/test/`
- `jest.config.js` configurado para TypeScript e paths
- Todos os types do Jest disponíveis globalmente

### **2. Padrões Estabelecidos:**

- **Sem faker**: Use contadores e dados determinísticos
- **Either pattern**: Todos os casos de uso retornam `Either<Error, Success>`
- **Factories leves**: Dados mínimos necessários com override opcional
- **Helpers para relacionamentos**: Use quando múltiplas entidades se relacionam

### **3. Arquivos de Referência:**

- `check-user-permission.spec.ts` - Exemplo de teste complexo com múltiplas entidades
- `authenticate-device.spec.ts` - Exemplo de teste com criptografia e tokens
- `create-user.spec.ts` - Exemplo de teste simples e direto

### **4. Próximas Melhorias Opcionais:**

- [ ] Criar mais helpers para cenários comuns
- [ ] Adicionar testes de integração para controllers
- [ ] Implementar testes para as entidades do domínio
- [ ] Adicionar testes para os mappers do Prisma

---

## 🎉 **Meta Final**

**Objetivo:** 16/16 casos de uso testados (100% de cobertura)  
**Estimativa:** ~5-8 horas para completar os 5 casos restantes  
**Benefício:** Base sólida para refatorações e novas funcionalidades

---

_Este guia deve ser seguido para manter a consistência e qualidade dos testes já implementados. A metodologia testada e aprovada garante testes robustos, organizados e de fácil manutenção._
