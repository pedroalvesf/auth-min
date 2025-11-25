import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { User, UserProps } from '@/domain/auth/enterprise/entities/user';
import { RoleList } from '@/domain/auth/enterprise/entities/role-list';

let userCounter = 0;

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityID
) {
  userCounter++;

  const user = User.create(
    {
      name: `Test User ${userCounter}`,
      email: `user-${userCounter}@test.com`,
      password: 'Test@123456',
      roles: new RoleList(),
      ...override,
    },
    id
  );

  return user;
}
