import { RolesRepository } from '@/domain/auth/application/repositories/roles-repository';
import { Role } from '@/domain/auth/enterprise/entities/role';

export class InMemoryRolesRepository implements RolesRepository {
  public items: Role[] = [];

  async findById(id: string): Promise<Role | null> {
    const role = this.items.find((item) => item.id.toString() === id);
    return role ?? null;
  }

  async findBySlug(slug: string): Promise<Role | null> {
    const role = this.items.find((item) => item.slug === slug);
    return role ?? null;
  }

  async findByName(name: string): Promise<Role | null> {
    const role = this.items.find((item) => item.name === name);
    return role ?? null;
  }

  async findMany(): Promise<Role[]> {
    return this.items;
  }

  async create(role: Role): Promise<void> {
    this.items.push(role);
  }

  async save(role: Role): Promise<void> {
    const itemIndex = this.items.findIndex(
      (item) => item.id.toString() === role.id.toString()
    );

    if (itemIndex >= 0) {
      this.items[itemIndex] = role;
    }
  }

  async delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id.toString() === id);

    if (itemIndex >= 0) {
      this.items.splice(itemIndex, 1);
    }
  }
}
