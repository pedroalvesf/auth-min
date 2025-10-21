import { User as PrismaUser, Prisma } from "@prisma/client";
import { User } from "@/domain/auth/enterprise/entities/user";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export class PrismaUsersMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        email: raw.email,
        password: raw.password,
        name: raw.name ?? undefined,
        lastLoginAt: raw.lastLoginAt ?? undefined,
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toPrisma(user: User): Prisma.UserCreateInput {
    return {
      id: user.id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toPrismaUpdate(user: User): Prisma.UserUpdateInput {
    return {
      id: user.id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      updatedAt: user.updatedAt,
    };
  }
}
