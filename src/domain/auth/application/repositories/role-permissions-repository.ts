import { RolePermission } from '../../enterprise/entities/role-permission';

export abstract class RolePermissionsRepository {
  abstract create(rolePermission: RolePermission): Promise<void>;
  abstract save(rolePermission: RolePermission): Promise<void>;
  abstract findById(id: string): Promise<RolePermission | null>;
  abstract findByRoleId(roleId: string): Promise<RolePermission[]>;
  abstract findByPermissionId(permissionId: string): Promise<RolePermission[]>;
  abstract findByRoleAndPermission(
    roleId: string,
    permissionId: string
  ): Promise<RolePermission | null>;
  abstract delete(id: string): Promise<void>;
  abstract deleteByRoleId(roleId: string): Promise<void>;
  abstract deleteByPermissionId(permissionId: string): Promise<void>;
}
