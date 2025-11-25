import { Permission } from '@/domain/auth/enterprise/entities/permission';

export abstract class PermissionsRepository {
  abstract create(permission: Permission): Promise<void>;
  abstract save(permission: Permission): Promise<void>;
  abstract findById(id: string): Promise<Permission | null>;
  abstract findBySlug(slug: string): Promise<Permission | null>;
  abstract findByResourceAndAction(
    resource: string,
    action: string
  ): Promise<Permission | null>;
  abstract findMany(): Promise<Permission[]>;
  abstract findByRoleId(roleId: string): Promise<Permission[]>;
  abstract delete(id: string): Promise<void>;
}
