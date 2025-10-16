/*
 * FACTORY PARA USE CASES - DI CUSTOMIZADO
 * Este sistema foi substituído pelos modules do NestJS
 * Mantido comentado para referência futura
 */

import { container } from './container';
import { TOKENS } from './tokens';

// Importar tipos dos casos de uso
import type { AuthenticateDeviceUseCase } from '../../domain/auth/application/use-cases/authenticate-device';
import type { ValidateTokenUseCase } from '../../domain/auth/application/use-cases/validate-token';
import type { RefreshAccessTokenUseCase } from '../../domain/auth/application/use-cases/refresh-access-token';
import type { RegisterUserUseCase } from '../../domain/auth/application/use-cases/register-user';
import type { RevokeUserDeviceUseCase } from '../../domain/auth/application/use-cases/revoke-user-device';
import type { RevokeAllDevicesByUserUseCase } from '../../domain/auth/application/use-cases/revoke-all-devices-by-user';

export class UseCaseFactory {
  static getAuthenticateDeviceUseCase(): AuthenticateDeviceUseCase {
    return container.resolve<AuthenticateDeviceUseCase>(TOKENS.AUTHENTICATE_DEVICE_USE_CASE);
  }

  static getValidateTokenUseCase(): ValidateTokenUseCase {
    return container.resolve<ValidateTokenUseCase>(TOKENS.VALIDATE_TOKEN_USE_CASE);
  }

  static getRefreshAccessTokenUseCase(): RefreshAccessTokenUseCase {
    return container.resolve<RefreshAccessTokenUseCase>(TOKENS.REFRESH_ACCESS_TOKEN_USE_CASE);
  }

  static getRegisterUserUseCase(): RegisterUserUseCase {
    return container.resolve<RegisterUserUseCase>(TOKENS.REGISTER_USER_USE_CASE);
  }

  static getRevokeUserDeviceUseCase(): RevokeUserDeviceUseCase {
    return container.resolve<RevokeUserDeviceUseCase>(TOKENS.REVOKE_USER_DEVICE_USE_CASE);
  }

  static getRevokeAllDevicesByUserUseCase(): RevokeAllDevicesByUserUseCase {
    return container.resolve<RevokeAllDevicesByUserUseCase>(TOKENS.REVOKE_ALL_DEVICES_BY_USER_USE_CASE);
  }
}

// Helper functions para uso direto
export const getAuthenticateDeviceUseCase = () => UseCaseFactory.getAuthenticateDeviceUseCase();
export const getValidateTokenUseCase = () => UseCaseFactory.getValidateTokenUseCase();
export const getRefreshAccessTokenUseCase = () => UseCaseFactory.getRefreshAccessTokenUseCase();
export const getRegisterUserUseCase = () => UseCaseFactory.getRegisterUserUseCase();
export const getRevokeUserDeviceUseCase = () => UseCaseFactory.getRevokeUserDeviceUseCase();
export const getRevokeAllDevicesByUserUseCase = () => UseCaseFactory.getRevokeAllDevicesByUserUseCase();