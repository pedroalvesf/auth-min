import { AccessToken } from '@/domain/auth/enterprise/entities/access-token';

export class AccessTokenPresenter {
  static toHTTP(accessToken: AccessToken) {
    return {
      token: accessToken.token,
      expiresAt: accessToken.expiresAt,
    };
  }
}
