import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RefreshTokenRepository } from '@/domain/auth/application/repositories/refresh-token-repository';
import { PrismaRefreshTokenMapper } from '../mappers/prisma-refresh-token-mapper';
import { RefreshToken } from '@/domain/auth/enterprise/entities/refresh-token';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private prisma: PrismaService) {}

  async create(refreshToken: RefreshToken): Promise<void> {
    const data = PrismaRefreshTokenMapper.toPrisma(refreshToken);
    await this.prisma.refreshToken.create({ data });
  }

  async findByDeviceId(deviceId: string): Promise<RefreshToken[]> {
    const refreshTokens = await this.prisma.refreshToken.findMany({
      where: { deviceId },
    });
    return refreshTokens.map(PrismaRefreshTokenMapper.toDomain);
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const refreshTokens = await this.prisma.refreshToken.findMany({
      where: { userId },
    });
    return refreshTokens.map(PrismaRefreshTokenMapper.toDomain);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    return refreshToken
      ? PrismaRefreshTokenMapper.toDomain(refreshToken)
      : null;
  }

  async save(refreshToken: RefreshToken): Promise<void> {
    const data = PrismaRefreshTokenMapper.toPrisma(refreshToken);
    await this.prisma.refreshToken.update({
      where: { id: refreshToken.id.toString() },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { id },
    });
  }
}
