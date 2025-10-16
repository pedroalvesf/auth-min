import { PrismaClient } from "@prisma/client";
import { RefreshToken } from "../../../../domain/auth/enterprise/entities/refresh-token";
import { RefreshTokenRepository } from "../../../../domain/repositories/refresh-token-repository";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private prisma: PrismaClient) {}

  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) {
      return null;
    }

    return RefreshToken.reconstruct(
      {
        userId: new UniqueEntityID(refreshToken.userId),
        deviceId: new UniqueEntityID(refreshToken.deviceId),
        token: refreshToken.token,
        expiresAt: refreshToken.expiresAt,
        createdAt: refreshToken.createdAt,
        revokedAt: refreshToken.revokedAt ?? undefined,
        revoked: refreshToken.revoked,
      },
      new UniqueEntityID(refreshToken.id)
    );
  }

  async findByUserId(userId: UniqueEntityID): Promise<RefreshToken[]> {
    const refreshTokens = await this.prisma.refreshToken.findMany({
      where: { userId: userId.toString() },
      orderBy: { createdAt: "desc" },
    });

    return refreshTokens.map((token) =>
      RefreshToken.reconstruct(
        {
          userId: new UniqueEntityID(token.userId),
          token: token.token,
          expiresAt: token.expiresAt,
          createdAt: token.createdAt,
          revokedAt: token.revokedAt,
        },
        new UniqueEntityID(token.id)
      )
    );
  }

  async findValidByUserId(userId: UniqueEntityID): Promise<RefreshToken[]> {
    const refreshTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: userId.toString(),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return refreshTokens.map((token) =>
      RefreshToken.reconstruct(
        {
          userId: new UniqueEntityID(token.userId),
          token: token.token,
          expiresAt: token.expiresAt,
          createdAt: token.createdAt,
          revokedAt: token.revokedAt,
        },
        new UniqueEntityID(token.id)
      )
    );
  }

  async save(refreshToken: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.upsert({
      where: { id: refreshToken.id.toString() },
      create: {
        id: refreshToken.id.toString(),
        userId: refreshToken.userId.toString(),
        deviceId: refreshToken.deviceId.toString(),
        token: refreshToken.token,
        expiresAt: refreshToken.expiresAt,
        revokedAt: refreshToken.revokedAt ?? undefined,
        revoked: refreshToken.revoked,
        createdAt: refreshToken.createdAt,
      },
      update: {
        revokedAt: refreshToken.revokedAt ?? undefined,
        revoked: refreshToken.revoked,
      },
    });
  }

  async delete(id: UniqueEntityID): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { id: id.toString() },
    });
  }

  async deleteByUserId(userId: UniqueEntityID): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId: userId.toString() },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }

  async revokeByUserId(userId: UniqueEntityID): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId: userId.toString(),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}