# Como Usar a Injeção de Dependência

## Sistema Implementado

Criamos um **Container IoC simples** que substitui o `@Injectable()` do NestJS, mantendo os mesmos princípios de Injeção de Dependência.

## Estrutura

```
src/
├── core/
│   └── container/
│       ├── container.ts          # Container IoC principal
│       ├── tokens.ts             # Tokens para identificar serviços
│       └── use-case-factory.ts   # Factory para casos de uso
├── infra/
│   └── container/
│       └── container-setup.ts    # Configuração das dependências
└── main.ts                       # Inicialização do sistema
```

## Como Funciona

### 1. Registrar Dependências
```typescript
// infra/container/container-setup.ts
export function setupContainer(): void {
  // Registrar repositórios
  container.registerClass(
    TOKENS.USERS_REPOSITORY,
    PrismaUsersRepository,
    [TOKENS.PRISMA_CLIENT]  // Dependências
  );

  // Registrar casos de uso
  container.registerClass(
    TOKENS.AUTHENTICATE_DEVICE_USE_CASE,
    AuthenticateDeviceUseCase,
    [
      TOKENS.DEVICES_REPOSITORY,
      TOKENS.USERS_REPOSITORY,
      TOKENS.REFRESH_TOKEN_REPOSITORY,
      TOKENS.HASH_COMPARER,
      TOKENS.ENCRYPTER,
    ]
  );
}
```

### 2. Resolver Dependências
```typescript
// main.ts
async function bootstrap() {
  // Inicializar container
  setupContainer();
  
  // Resolver casos de uso (com todas as dependências injetadas)
  const authenticateUseCase = getAuthenticateDeviceUseCase();
  const validateUseCase = getValidateTokenUseCase();
}
```

### 3. Usar em Controllers
```typescript
// controllers/auth-controller.ts
import { getAuthenticateDeviceUseCase } from '../core/container/use-case-factory';

export class AuthController {
  async login(request: Request, response: Response) {
    // Resolve automaticamente com todas as dependências
    const useCase = getAuthenticateDeviceUseCase();
    
    const result = await useCase.execute({
      password: request.body.password,
      device: request.body.device,
    });
    
    if (result.isLeft()) {
      return response.status(401).json({ error: result.value.message });
    }
    
    return response.json(result.value);
  }
}
```

## Vantagens vs NestJS

### Com NestJS:
```typescript
@Injectable()
export class AuthenticateDeviceUseCase {
  constructor(
    private devicesRepository: DevicesRepository,
    private usersRepository: UsersRepository,
    // DI automática via decorators
  ) {}
}
```

### Nossa Implementação:
```typescript
export class AuthenticateDeviceUseCase {
  constructor(
    private devicesRepository: DevicesRepository,
    private usersRepository: UsersRepository,
    // DI manual via container
  ) {}
}
```

## Benefícios

✅ **Sem dependência de framework**: Código portável  
✅ **Mesma funcionalidade**: DI completa  
✅ **Fácil teste**: Mock de dependências  
✅ **Type-safe**: TypeScript completo  
✅ **Singleton automático**: Instâncias reutilizadas  
✅ **Lazy loading**: Criação sob demanda  

## Exemplo Completo de Uso

```typescript
// 1. Configurar (main.ts)
setupContainer();

// 2. Usar em qualquer lugar
const useCase = getAuthenticateDeviceUseCase();

// 3. Executar com confiança (todas as deps estão injetadas)
const result = await useCase.execute({
  password: "user-password",
  device: deviceData
});
```

## Testes

```typescript
// test/auth.test.ts
describe('AuthenticateDeviceUseCase', () => {
  beforeEach(() => {
    // Mock das dependências no container
    container.register(TOKENS.USERS_REPOSITORY, mockUsersRepository);
    container.register(TOKENS.HASH_COMPARER, mockHashComparer);
  });

  it('should authenticate user', async () => {
    const useCase = getAuthenticateDeviceUseCase();
    // teste...
  });
});
```

Desta forma, conseguimos a mesma funcionalidade do `@Injectable()` sem dependência do NestJS!