import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Permission } from '@/domain/auth/enterprise/entities/permission';
import { Permission as PrismaPermission } from '@/generated/prisma/client';

export class PrismaPermissionMapper {
  static toDomain(raw: PrismaPermission): Permission {
    return Permission.create(
      {
        name: raw.name,
        slug: raw.slug,
        description: raw.description ?? undefined,
        resource: raw.resource,
        action: raw.action,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toPrisma(permission: Permission): PrismaPermission {
    return {
      id: permission.id.toString(),
      name: permission.name,
      slug: permission.slug,
      description: permission.description ?? null,
      resource: permission.resource,
      action: permission.action,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }
}
