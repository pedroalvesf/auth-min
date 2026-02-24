import {
  User as PrismaUser,
  Prisma,
  Role as PrismaRole,
} from '@/generated/prisma/client';
import { User } from '@/domain/auth/enterprise/entities/user';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { RoleList } from '@/domain/auth/enterprise/entities/role-list';
import { PrismaRoleMapper } from './prisma-role-mapper';

export class PrismaUsersMapper {
  static toDomain(raw: PrismaUserWithRoles): User {
    return User.create(
      {
        email: raw.email,
        password: raw.password,
        name: raw.name ?? undefined,
        isActive: raw.isActive,
        lastLoginAt: raw.lastLoginAt ?? undefined,
        roles: new RoleList(
          raw.roles?.map((role) => PrismaRoleMapper.toDomain(role)) || []
        ),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
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

export type PrismaUserWithRoles = PrismaUser & {
  roles?: PrismaRole[];
};
