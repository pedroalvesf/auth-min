import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../../../../domain/repositories/user-repository";
import { User } from "../../../../domain/auth/enterprise/entities/user";
import { Role } from "../../../../domain/auth/enterprise/entities/role";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: UniqueEntityID): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.toString() },
    });

    if (!user) return null;

    return User.reconstruct(
      {
        email: user.email,
        password: user.password,
        name: user.name || undefined,
        role: user.role as Role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      new UniqueEntityID(user.id)
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return User.reconstruct(
      {
        email: user.email,
        password: user.password,
        name: user.name || undefined,
        role: user.role as Role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      new UniqueEntityID(user.id)
    );
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id.toString() },
      create: {
        id: user.id.toString(),
        email: user.email,
        password: user.password,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      update: {
        email: user.email,
        password: user.password,
        name: user.name,
        updatedAt: user.updatedAt,
      },
    });
  }

  async delete(id: UniqueEntityID): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.toString() },
    });
  }
}
