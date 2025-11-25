import { RefreshToken } from '@/domain/auth/enterprise/entities/refresh-token';

export class RefreshTokenPresenter {
  static toHTTP(refreshToken: RefreshToken) {
    return {
      token: refreshToken.token,
      expiresAt: refreshToken.expiresAt,
    };
  }
}
