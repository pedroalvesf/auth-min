import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Role, RoleProps } from "@/domain/auth/enterprise/entities/role";

let roleCounter = 0;

export function makeRole(
  override: Partial<RoleProps> = {},
  id?: UniqueEntityID
) {
  roleCounter++;
  
  const role = Role.create(
    {
      name: `Test Role ${roleCounter}`,
      slug: `test-role-${roleCounter}`,
      description: `Test role description ${roleCounter}`,
      level: 1,
      assignableRoles: [],
      ...override,
    },
    id
  );

  return role;
}