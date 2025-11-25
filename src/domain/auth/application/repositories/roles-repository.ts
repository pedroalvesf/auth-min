import { Role } from '../../enterprise/entities/role';

export abstract class RolesRepository {
  abstract create(role: Role): Promise<void>;
  abstract save(role: Role): Promise<void>;
  abstract findById(id: string): Promise<Role | null>;
  abstract findBySlug(slug: string): Promise<Role | null>;
  abstract findByName(name: string): Promise<Role | null>;
  abstract findMany(): Promise<Role[]>;
  abstract delete(id: string): Promise<void>;
}
