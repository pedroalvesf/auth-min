import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Role } from '@/domain/auth/enterprise/entities/role';
import { PermissionList } from '@/domain/auth/enterprise/entities/permission-list';
import {
  Role as PrismaRole,
  Permission as PrismaPermission,
} from '@/generated/prisma/client';
import { PrismaPermissionMapper } from './prisma-permission-mapper';

export class PrismaRoleMapper {
  static toDomain(raw: PrismaRoleWithPermissions): Role {
    return Role.create(
      {
        name: raw.name,
        slug: raw.slug,
        description: raw.description ?? undefined,
        level: raw.level,
        assignableRoles: raw.assignableRoles || [],
        permissions: new PermissionList(
          raw.permissions?.map((permission) =>
            PrismaPermissionMapper.toDomain(permission)
          ) || []
        ),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toPrisma(role: Role): PrismaRole {
    return {
      id: role.id.toString(),
      name: role.name,
      slug: role.slug,
      description: role.description ?? null,
      level: role.level,
      assignableRoles: role.assignableRoles || [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}

export type PrismaRoleWithPermissions = PrismaRole & {
  permissions?: PrismaPermission[];
};
