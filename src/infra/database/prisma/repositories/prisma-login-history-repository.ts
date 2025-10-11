import { PrismaClient } from "@prisma/client";
import { LoginHistoryRepository } from "../../../../domain/repositories/login-history-repository";
import { LoginHistory } from "../../../../domain/auth/enterprise/entities/login-history";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";

export class PrismaLoginHistoryRepository implements LoginHistoryRepository {
  constructor(private prisma: PrismaClient) {}

  async save(loginHistory: LoginHistory): Promise<void> {
    await this.prisma.loginHistory.create({
      data: {
        id: loginHistory.id.toString(),
        userId: loginHistory.userId.toString(),
        ipAddress: loginHistory.ipAddress,
        userAgent: loginHistory.userAgent,
        success: loginHistory.success,
        createdAt: loginHistory.createdAt,
      },
    });
  }

  async findByUserId(
    userId: UniqueEntityID,
    limit = 50
  ): Promise<LoginHistory[]> {
    const histories = await this.prisma.loginHistory.findMany({
      where: { userId: userId.toString() },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return histories.map((history) =>
      LoginHistory.reconstruct(
        {
          userId: new UniqueEntityID(history.userId),
          ipAddress: history.ipAddress,
          userAgent: history.userAgent || undefined,
          success: history.success,
          createdAt: history.createdAt,
        },
        new UniqueEntityID(history.id)
      )
    );
  }

  async findRecentFailedAttempts(
    ipAddress: string,
    minutesAgo: number
  ): Promise<LoginHistory[]> {
    const timeThreshold = new Date(Date.now() - minutesAgo * 60 * 1000);

    const histories = await this.prisma.loginHistory.findMany({
      where: {
        ipAddress,
        success: false,
        createdAt: {
          gte: timeThreshold,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return histories.map((history) =>
      LoginHistory.reconstruct(
        {
          userId: new UniqueEntityID(history.userId),
          ipAddress: history.ipAddress,
          userAgent: history.userAgent || undefined,
          success: history.success,
          createdAt: history.createdAt,
        },
        new UniqueEntityID(history.id)
      )
    );
  }

  async countByUserId(userId: UniqueEntityID): Promise<number> {
    return await this.prisma.loginHistory.count({
      where: { userId: userId.toString() },
    });
  }

  async delete(id: UniqueEntityID): Promise<void> {
    await this.prisma.loginHistory.delete({
      where: { id: id.toString() },
    });
  }

  async deleteOldRecords(daysAgo: number): Promise<void> {
    const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    await this.prisma.loginHistory.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  }
}
