import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository';
import { User } from '@/domain/auth/enterprise/entities/user';
import { Role } from '@/domain/auth/enterprise/entities/role';

/**
 * Helper function to add a domain role to the in-memory user repository
 * This bridges the gap between domain entities and Prisma types in tests
 */
export function addRoleToUserRepository(
  usersRepository: InMemoryUsersRepository,
  role: Role
): void {
  usersRepository.addRole({
    id: role.id.toString(),
    name: role.name,
    slug: role.slug,
  });
}

/**
 * Helper function to setup a complete user-role-permission relationship
 */
export async function setupUserRoleRelationship(
  usersRepository: InMemoryUsersRepository,
  user: User,
  role: Role
): Promise<void> {
  await usersRepository.create(user);
  addRoleToUserRepository(usersRepository, role);
  await usersRepository.assignRole(user.id.toString(), role.id.toString());
}
