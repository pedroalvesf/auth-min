import { PrismaClient } from "@prisma/client";
import { SessionRepository } from "../../../../domain/repositories/session-repository";
import { Session } from "../../../../domain/auth/enterprise/entities/session";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";

export class PrismaSessionRepository implements SessionRepository {
  constructor(private prisma: PrismaClient) {}

  async findByToken(token: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { token },
    });

    if (!session) return null;

    return Session.reconstruct(
      {
        userId: new UniqueEntityID(session.userId),
        token: session.token,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
      },
      new UniqueEntityID(session.id)
    );
  }

  async findByUserId(userId: UniqueEntityID): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId: userId.toString() },
    });

    return sessions.map((session) =>
      Session.reconstruct(
        {
          userId: new UniqueEntityID(session.userId),
          token: session.token,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt,
        },
        new UniqueEntityID(session.id)
      )
    );
  }

  async save(session: Session): Promise<void> {
    await this.prisma.session.upsert({
      where: { id: session.id.toString() },
      create: {
        id: session.id.toString(),
        userId: session.userId.toString(),
        token: session.token,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
      },
      update: {
        userId: session.userId.toString(),
        token: session.token,
        expiresAt: session.expiresAt,
      },
    });
  }

  async delete(id: UniqueEntityID): Promise<void> {
    await this.prisma.session.delete({
      where: { id: id.toString() },
    });
  }

  async deleteByUserId(userId: UniqueEntityID): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId: userId.toString() },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
