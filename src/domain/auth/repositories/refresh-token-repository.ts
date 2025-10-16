import { RefreshToken } from "@/domain/auth/enterprise/entities/refresh-token";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export interface RefreshTokenRepository {
  findByToken(token: string): Promise<RefreshToken | null>;
  findByUserId(userId: UniqueEntityID): Promise<RefreshToken[]>;
  findByDeviceId(deviceId: UniqueEntityID): Promise<RefreshToken[]>;
  findValidByUserId(userId: UniqueEntityID): Promise<RefreshToken[]>;
  save(refreshToken: RefreshToken): Promise<void>;
  delete(id: UniqueEntityID): Promise<void>;
  deleteByUserId(userId: UniqueEntityID): Promise<void>;
  deleteExpired(): Promise<void>;
  revokeByUserId(userId: UniqueEntityID): Promise<void>;
}
