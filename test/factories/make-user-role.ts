import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  UserRole,
  UserRoleProps,
} from '@/domain/auth/enterprise/entities/user-role';

export function makeUserRole(
  override: Partial<UserRoleProps> = {},
  id?: UniqueEntityID
) {
  const userRole = UserRole.create(
    {
      userId: new UniqueEntityID('user-1'),
      roleId: new UniqueEntityID('role-1'),
      ...override,
    },
    id
  );

  return userRole;
}
