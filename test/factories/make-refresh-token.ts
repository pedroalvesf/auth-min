import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  RefreshToken,
  RefreshTokenProps,
} from '@/domain/auth/enterprise/entities/refresh-token';

let refreshTokenCounter = 0;

export function makeRefreshToken(
  override: Partial<RefreshTokenProps> = {},
  id?: UniqueEntityID
) {
  refreshTokenCounter++;

  const refreshToken = RefreshToken.create(
    {
      userId: new UniqueEntityID('user-1'),
      deviceId: new UniqueEntityID('device-1'),
      token: `refresh-token-${refreshTokenCounter}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      revoked: false,
      ...override,
    },
    id
  );

  return refreshToken;
}
