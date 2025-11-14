import { RolePermissionsRepository } from "@/domain/auth/application/repositories/role-permissions-repository";
import { RolePermission } from "@/domain/auth/enterprise/entities/role-permission";

export class InMemoryRolePermissionsRepository implements RolePermissionsRepository {
  public items: RolePermission[] = [];

  async create(rolePermission: RolePermission): Promise<void> {
    this.items.push(rolePermission);
  }

  async save(rolePermission: RolePermission): Promise<void> {
    const itemIndex = this.items.findIndex(item => item.id.equals(rolePermission.id));
    if (itemIndex >= 0) {
      this.items[itemIndex] = rolePermission;
    }
  }

  async findById(id: string): Promise<RolePermission | null> {
    const rolePermission = this.items.find(item => item.id.toString() === id);
    return rolePermission || null;
  }

  async findByRoleId(roleId: string): Promise<RolePermission[]> {
    return this.items.filter(item => item.roleId.toString() === roleId);
  }

  async findByPermissionId(permissionId: string): Promise<RolePermission[]> {
    return this.items.filter(item => item.permissionId.toString() === permissionId);
  }

  async findByRoleAndPermission(roleId: string, permissionId: string): Promise<RolePermission | null> {
    const rolePermission = this.items.find(
      item => item.roleId.toString() === roleId && item.permissionId.toString() === permissionId
    );
    return rolePermission || null;
  }

  async delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex(item => item.id.toString() === id);
    if (itemIndex >= 0) {
      this.items.splice(itemIndex, 1);
    }
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    this.items = this.items.filter(item => item.roleId.toString() !== roleId);
  }

  async deleteByPermissionId(permissionId: string): Promise<void> {
    this.items = this.items.filter(item => item.permissionId.toString() !== permissionId);
  }
}