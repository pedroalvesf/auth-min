import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { User, UserProps } from "@/domain/auth/enterprise/entities/user";

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
      ...override,
    },
    id
  );

  return user;
}