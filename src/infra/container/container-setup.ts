/*
 * CONFIGURAÇÃO DO CONTAINER CUSTOMIZADO
 * Este sistema foi substituído pelos modules do NestJS
 * Mantido comentado para referência futura
 */

import { PrismaClient } from '@prisma/client';
import { container } from '../../core/container/container';
import { TOKENS } from '../../core/container/tokens';

// Repositories
import { PrismaUsersRepository } from '../database/prisma/repositories/prisma-users-repository';
import { PrismaDevicesRepository } from '../database/prisma/repositories/prisma-devices-repository';
import { PrismaRefreshTokenRepository } from '../database/prisma/repositories/prisma-refresh-token-repository';
import { PrismaAccessTokenRepository } from '../database/prisma/repositories/prisma-access-token-repository';

// Cryptography
import { BcryptHasher } from '../cryptography/bcrypt-hasher';
import { JwtEncrypter } from '../cryptography/jwt-encrypter';
import { JwtTokenValidator } from '../cryptography/jwt-token-validator';

// Use Cases
import { AuthenticateDeviceUseCase } from '../../domain/auth/application/use-cases/authenticate-device';
import { ValidateTokenUseCase } from '../../domain/auth/application/use-cases/validate-token';
import { RefreshAccessTokenUseCase } from '../../domain/auth/application/use-cases/refresh-access-token';
import { RegisterUserUseCase } from '../../domain/auth/application/use-cases/register-user';
import { RevokeUserDeviceUseCase } from '../../domain/auth/application/use-cases/revoke-user-device';
import { RevokeAllDevicesByUserUseCase } from '../../domain/auth/application/use-cases/revoke-all-devices-by-user';

export function setupContainer(): void {
  // Infrastructure
  container.register(TOKENS.PRISMA_CLIENT, new PrismaClient());
  container.register(TOKENS.JWT_SECRET, process.env.JWT_SECRET || 'your-secret-key');

  // Repositories
  container.registerClass(
    TOKENS.USERS_REPOSITORY,
    PrismaUsersRepository,
    [TOKENS.PRISMA_CLIENT]
  );

  container.registerClass(
    TOKENS.DEVICES_REPOSITORY,
    PrismaDevicesRepository,
    [TOKENS.PRISMA_CLIENT]
  );

  container.registerClass(
    TOKENS.REFRESH_TOKEN_REPOSITORY,
    PrismaRefreshTokenRepository,
    [TOKENS.PRISMA_CLIENT]
  );

  container.registerClass(
    TOKENS.ACCESS_TOKEN_REPOSITORY,
    PrismaAccessTokenRepository,
    [TOKENS.PRISMA_CLIENT]
  );

  // Cryptography (usando o mesmo hasher para comparer e generator)
  container.registerClass(TOKENS.HASH_COMPARER, BcryptHasher, []);
  container.registerClass(TOKENS.HASH_GENERATOR, BcryptHasher, []);
  
  container.registerClass(
    TOKENS.ENCRYPTER,
    JwtEncrypter,
    [TOKENS.JWT_SECRET]
  );

  container.registerClass(
    TOKENS.TOKEN_VALIDATOR,
    JwtTokenValidator,
    [TOKENS.JWT_SECRET]
  );

  // Use Cases
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

  container.registerClass(
    TOKENS.VALIDATE_TOKEN_USE_CASE,
    ValidateTokenUseCase,
    [
      TOKENS.USERS_REPOSITORY,
      TOKENS.ACCESS_TOKEN_REPOSITORY,
      TOKENS.TOKEN_VALIDATOR,
    ]
  );

  container.registerClass(
    TOKENS.REFRESH_ACCESS_TOKEN_USE_CASE,
    RefreshAccessTokenUseCase,
    [
      TOKENS.USERS_REPOSITORY,
      TOKENS.REFRESH_TOKEN_REPOSITORY,
      TOKENS.ENCRYPTER,
    ]
  );

  container.registerClass(
    TOKENS.REGISTER_USER_USE_CASE,
    RegisterUserUseCase,
    [
      TOKENS.USERS_REPOSITORY,
      TOKENS.HASH_GENERATOR,
    ]
  );

  container.registerClass(
    TOKENS.REVOKE_USER_DEVICE_USE_CASE,
    RevokeUserDeviceUseCase,
    [
      TOKENS.DEVICES_REPOSITORY,
      TOKENS.REFRESH_TOKEN_REPOSITORY,
      TOKENS.ACCESS_TOKEN_REPOSITORY,
    ]
  );

  container.registerClass(
    TOKENS.REVOKE_ALL_DEVICES_BY_USER_USE_CASE,
    RevokeAllDevicesByUserUseCase,
    [
      TOKENS.USERS_REPOSITORY,
      TOKENS.DEVICES_REPOSITORY,
      TOKENS.REFRESH_TOKEN_REPOSITORY,
      TOKENS.ACCESS_TOKEN_REPOSITORY,
    ]
  );
}