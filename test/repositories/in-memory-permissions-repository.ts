import { PermissionsRepository } from '@/domain/auth/application/repositories/permissions-repository';
import { Permission } from '@/domain/auth/enterprise/entities/permission';

export class InMemoryPermissionsRepository implements PermissionsRepository {
  public items: Permission[] = [];

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

  async findByRoleId(_roleId: string): Promise<Permission[]> {
    // For this in-memory implementation, we'll return empty array
    // In a real implementation, this would query role-permission relationships
    return [];
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
