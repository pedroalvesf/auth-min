import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import {
  UserRole,
  UserRoleProps,
} from '@/domain/auth/enterprise/entities/user-role';

let userRoleCounter = 0;

export function makeUserRole(
  override: Partial<UserRoleProps> = {},
  id?: UniqueEntityID
) {
  userRoleCounter++;

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
