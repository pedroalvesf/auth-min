import { PrismaClient } from "@prisma/client";
import { AccessToken } from "../../../../domain/auth/enterprise/entities/access-token";
import { AccessTokenRepository } from "../../../../domain/repositories/access-token-repository";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";

export class PrismaAccessTokenRepository implements AccessTokenRepository {
  constructor(private prisma: PrismaClient) {}

  async findByToken(token: string): Promise<AccessToken | null> {
    const accessToken = await this.prisma.accessToken.findUnique({
      where: { token },
    });

    if (!accessToken) {
      return null;
    }

    return AccessToken.create(
      {
        userId: new UniqueEntityID(accessToken.userId),
        token: accessToken.token,
        expiresAt: accessToken.expiresAt,
        createdAt: accessToken.createdAt,
        revoked: accessToken.revoked,
      },
      new UniqueEntityID(accessToken.id)
    );
  }

  async findByUserId(userId: UniqueEntityID): Promise<AccessToken[]> {
    const accessTokens = await this.prisma.accessToken.findMany({
      where: { userId: userId.toString() },
      orderBy: { createdAt: "desc" },
    });

    return accessTokens.map((token) =>
      AccessToken.create(
        {
          userId: new UniqueEntityID(token.userId),
          token: token.token,
          expiresAt: token.expiresAt,
          createdAt: token.createdAt,
          revoked: token.revoked,
        },
        new UniqueEntityID(token.id)
      )
    );
  }

  async save(accessToken: AccessToken): Promise<void> {
    await this.prisma.accessToken.create({
      data: {
        id: accessToken.id.toString(),
        userId: accessToken.userId.toString(),
        token: accessToken.token,
        expiresAt: accessToken.expiresAt,
        createdAt: accessToken.createdAt,
      },
    });
  }

  async delete(id: UniqueEntityID): Promise<void> {
    await this.prisma.accessToken.delete({
      where: { id: id.toString() },
    });
  }

  async deleteByUserId(userId: UniqueEntityID): Promise<void> {
    await this.prisma.accessToken.deleteMany({
      where: { userId: userId.toString() },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.accessToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}