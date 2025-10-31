import { UsersRepository } from "@/domain/auth/application/repositories/users-repository";
import { User } from "@/domain/auth/enterprise/entities/user";
import { Role } from "@prisma/client";

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];
  public userRoles: { userId: string; roleId: string; assignedBy?: string }[] = [];
  public roles: Role[] = [];

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id.toString() === id);
    return user ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email);
    return user ?? null;
  }

  async create(user: User): Promise<void> {
    this.items.push(user);
  }

  async save(user: User): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id.toString() === user.id.toString()
    );

    if (itemIndex >= 0) {
      this.items[itemIndex] = user;
    }
  }

  async delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id.toString() === id
    );

    if (itemIndex >= 0) {
      this.items.splice(itemIndex, 1);
      // Remove roles associados ao usuário
      this.userRoles = this.userRoles.filter(
        (userRole) => userRole.userId !== id
      );
    }
  }

  async assignRole(
    userId: string,
    roleId: string,
    assignedBy?: string
  ): Promise<void> {
    // Verifica se a associação já existe
    const existingAssignment = this.userRoles.find(
      (userRole) => userRole.userId === userId && userRole.roleId === roleId
    );

    if (!existingAssignment) {
      this.userRoles.push({
        userId,
        roleId,
        assignedBy,
      });
    }
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const itemIndex = this.userRoles.findIndex(
      (userRole) => userRole.userId === userId && userRole.roleId === roleId
    );

    if (itemIndex >= 0) {
      this.userRoles.splice(itemIndex, 1);
    }
  }

  async findRolesByUserId(userId: string): Promise<Role[]> {
    const userRoleIds = this.userRoles
      .filter((userRole) => userRole.userId === userId)
      .map((userRole) => userRole.roleId);

    return this.roles.filter((role) => userRoleIds.includes(role.id));
  }

  // Helper method para adicionar roles mock
  addRole(role: Role): void {
    this.roles.push(role);
  }
}