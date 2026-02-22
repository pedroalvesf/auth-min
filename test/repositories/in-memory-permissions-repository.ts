import { PermissionsRepository } from '@/domain/auth/application/repositories/permissions-repository';
import { Permission } from '@/domain/auth/enterprise/entities/permission';

export class InMemoryPermissionsRepository implements PermissionsRepository {
  public items: Permission[] = [];
  public rolePermissions: { roleId: string; permissionId: string }[] = [];

  async findById(id: string): Promise<Permission | null> {
    const permission = this.items.find((item) => item.id.toString() === id);
    return permission || null;
  }

  async findBySlug(slug: string): Promise<Permission | null> {
    const permission = this.items.find((item) => item.slug === slug);
    return permission || null;
  }

  async findByResourceAndAction(
    resource: string,
    action: string
  ): Promise<Permission | null> {
    const permission = this.items.find(
      (item) => item.resource === resource && item.action === action
    );
    return permission || null;
  }

  async findMany(): Promise<Permission[]> {
    return this.items;
  }

  async findByRoleId(roleId: string): Promise<Permission[]> {
    const permissionIds = this.rolePermissions
      .filter((rp) => rp.roleId === roleId)
      .map((rp) => rp.permissionId);

    return this.items.filter((item) =>
      permissionIds.includes(item.id.toString())
    );
  }

  addRolePermission(roleId: string, permissionId: string): void {
    this.rolePermissions.push({ roleId, permissionId });
  }

  async create(permission: Permission): Promise<void> {
    this.items.push(permission);
  }

  async save(permission: Permission): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === permission.id);

    if (itemIndex >= 0) {
      this.items[itemIndex] = permission;
    }
  }

  async delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id.toString() === id);

    if (itemIndex >= 0) {
      this.items.splice(itemIndex, 1);
    }
  }
}
