import {
  RefreshToken as PrismaRefreshToken,
  Prisma,
} from '@/generated/prisma/client';
import { RefreshToken } from '@/domain/auth/enterprise/entities/refresh-token';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

export class PrismaRefreshTokenMapper {
  static toDomain(raw: PrismaRefreshToken): RefreshToken {
    return RefreshToken.create(
      {
        userId: new UniqueEntityID(raw.userId),
        token: raw.token,
        deviceId: new UniqueEntityID(raw.deviceId),
        createdAt: raw.createdAt,
        expiresAt: raw.expiresAt,
        revoked: raw.revoked,
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toPrisma(refreshToken: RefreshToken): Prisma.RefreshTokenCreateInput {
    return {
      id: refreshToken.id.toString(),
      token: refreshToken.token,
      createdAt: refreshToken.createdAt,
      expiresAt: refreshToken.expiresAt,
      revokedAt: refreshToken.revokedAt,
      revoked: refreshToken.revoked,
      User: {
        connect: {
          id: refreshToken.userId.toString(),
        },
      },
      Device: {
        connect: {
          id: refreshToken.deviceId.toString(),
        },
      },
    };
  }
}
