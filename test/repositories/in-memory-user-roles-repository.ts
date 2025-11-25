import { UserRolesRepository } from '@/domain/auth/application/repositories/user-roles-repository';
import { UserRole } from '@/domain/auth/enterprise/entities/user-role';

export class InMemoryUserRolesRepository implements UserRolesRepository {
  public items: UserRole[] = [];

  async create(userRole: UserRole): Promise<void> {
    this.items.push(userRole);
  }

  async save(userRole: UserRole): Promise<void> {
    const itemIndex = this.items.findIndex((item) =>
      item.id.equals(userRole.id)
    );
    if (itemIndex >= 0) {
      this.items[itemIndex] = userRole;
    }
  }

  async findById(id: string): Promise<UserRole | null> {
    const userRole = this.items.find((item) => item.id.toString() === id);
    return userRole || null;
  }

  async findByUserId(userId: string): Promise<UserRole[]> {
    return this.items.filter((item) => item.userId.toString() === userId);
  }

  async findByRoleId(roleId: string): Promise<UserRole[]> {
    return this.items.filter((item) => item.roleId.toString() === roleId);
  }

  async findByUserAndRole(
    userId: string,
    roleId: string
  ): Promise<UserRole | null> {
    const userRole = this.items.find(
      (item) =>
        item.userId.toString() === userId && item.roleId.toString() === roleId
    );
    return userRole || null;
  }

  async delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id.toString() === id);
    if (itemIndex >= 0) {
      this.items.splice(itemIndex, 1);
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.items = this.items.filter((item) => item.userId.toString() !== userId);
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    this.items = this.items.filter((item) => item.roleId.toString() !== roleId);
  }
}
