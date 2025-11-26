import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  RolePermission,
  RolePermissionProps,
} from '@/domain/auth/enterprise/entities/role-permission';

export function makeRolePermission(
  override: Partial<RolePermissionProps> = {},
  id?: UniqueEntityID
) {
  const rolePermission = RolePermission.create(
    {
      roleId: new UniqueEntityID('role-1'),
      permissionId: new UniqueEntityID('permission-1'),
      ...override,
    },
    id
  );

  return rolePermission;
}
