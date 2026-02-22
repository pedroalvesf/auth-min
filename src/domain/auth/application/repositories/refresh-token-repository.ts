import { RefreshToken } from '@/domain/auth/enterprise/entities/refresh-token';

export abstract class RefreshTokenRepository {
  abstract create(refreshToken: RefreshToken): Promise<void>;
  abstract findByDeviceId(deviceId: string): Promise<RefreshToken[]>;
  abstract findByToken(token: string): Promise<RefreshToken | null>;
  abstract save(refreshToken: RefreshToken): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findByUserId(userId: string): Promise<RefreshToken[]>;
}
