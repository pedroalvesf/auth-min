import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { RolePermission } from '@/domain/auth/enterprise/entities/role-permission';
import { RolePermission as PrismaRolePermission } from '@/generated/prisma/client';

export class PrismaRolePermissionMapper {
  static toDomain(raw: PrismaRolePermission): RolePermission {
    return RolePermission.create(
      {
        roleId: new UniqueEntityID(raw.roleId),
        permissionId: new UniqueEntityID(raw.permissionId),
      },
      new UniqueEntityID(raw.id)
    );
  }

  static toPrisma(rolePermission: RolePermission) {
    return {
      id: rolePermission.id.toString(),
      roleId: rolePermission.roleId.toString(),
      permissionId: rolePermission.permissionId.toString(),
    };
  }
}
