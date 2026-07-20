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
        deviceId: new UniqueEntityID(raw.deviceId),
        familyId: new UniqueEntityID(raw.familyId),
        token: raw.token,
        createdAt: raw.createdAt,
        expiresAt: raw.expiresAt,
        revokedAt: raw.revokedAt ?? undefined,
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toPrisma(
    refreshToken: RefreshToken
  ): Prisma.RefreshTokenUncheckedCreateInput {
    return {
      id: refreshToken.id.toString(),
      userId: refreshToken.userId.toString(),
      deviceId: refreshToken.deviceId.toString(),
      familyId: refreshToken.familyId.toString(),
      token: refreshToken.token,
      createdAt: refreshToken.createdAt,
      expiresAt: refreshToken.expiresAt,
      revokedAt: refreshToken.revokedAt,
    };
  }

  static toPrismaUpdate(
    refreshToken: RefreshToken
  ): Prisma.RefreshTokenUncheckedUpdateInput {
    return {
      expiresAt: refreshToken.expiresAt,
      revokedAt: refreshToken.revokedAt ?? null,
    };
  }
}
