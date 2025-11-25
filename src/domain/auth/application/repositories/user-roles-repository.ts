import { UserRole } from '../../enterprise/entities/user-role';

export abstract class UserRolesRepository {
  abstract create(userRole: UserRole): Promise<void>;
  abstract save(userRole: UserRole): Promise<void>;
  abstract findById(id: string): Promise<UserRole | null>;
  abstract findByUserId(userId: string): Promise<UserRole[]>;
  abstract findByRoleId(roleId: string): Promise<UserRole[]>;
  abstract findByUserAndRole(
    userId: string,
    roleId: string
  ): Promise<UserRole | null>;
  abstract delete(id: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
  abstract deleteByRoleId(roleId: string): Promise<void>;
}
