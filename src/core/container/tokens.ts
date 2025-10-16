/*
 * TOKENS PARA DI CUSTOMIZADO
 * Este sistema foi substituído pelos tokens do NestJS
 * Mantido comentado para referência futura
 */

// Tokens para identificar serviços
export const TOKENS = {
  // Repositories
  USERS_REPOSITORY: Symbol('UsersRepository'),
  DEVICES_REPOSITORY: Symbol('DevicesRepository'),
  REFRESH_TOKEN_REPOSITORY: Symbol('RefreshTokenRepository'),
  ACCESS_TOKEN_REPOSITORY: Symbol('AccessTokenRepository'),

  // Cryptography
  HASH_COMPARER: Symbol('HashComparer'),
  HASH_GENERATOR: Symbol('HashGenerator'),
  ENCRYPTER: Symbol('Encrypter'),
  TOKEN_VALIDATOR: Symbol('TokenValidator'),

  // Use Cases
  AUTHENTICATE_DEVICE_USE_CASE: Symbol('AuthenticateDeviceUseCase'),
  VALIDATE_TOKEN_USE_CASE: Symbol('ValidateTokenUseCase'),
  REFRESH_ACCESS_TOKEN_USE_CASE: Symbol('RefreshAccessTokenUseCase'),
  REGISTER_USER_USE_CASE: Symbol('RegisterUserUseCase'),
  REVOKE_USER_DEVICE_USE_CASE: Symbol('RevokeUserDeviceUseCase'),
  REVOKE_ALL_DEVICES_BY_USER_USE_CASE: Symbol('RevokeAllDevicesByUserUseCase'),

  // Infrastructure
  PRISMA_CLIENT: Symbol('PrismaClient'),
  JWT_SECRET: Symbol('JwtSecret'),
} as const;