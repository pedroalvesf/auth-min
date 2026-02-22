import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository';
import { InMemoryRolesRepository } from '@/test/repositories/in-memory-roles-repository';
import { makeUser } from '@/test/factories/make-user';
import { makeRole } from '@/test/factories/make-role';
import { RemoveRoleFromUserUseCase } from '../remove-role-from-user';
import { UserNotFoundError } from '../errors/user-not-found-error';
import { RoleNotFoundError } from '../errors/role-not-found-error';

let usersRepository: InMemoryUsersRepository;
let rolesRepository: InMemoryRolesRepository;
let sut: RemoveRoleFromUserUseCase;

describe('Remove Role From User', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    rolesRepository = new InMemoryRolesRepository();
    sut = new RemoveRoleFromUserUseCase(usersRepository, rolesRepository);
  });

  it('should be able to remove role from user', async () => {
    const user = makeUser();
    const userRole = makeRole({ slug: 'user', level: 0 });

    await usersRepository.create(user);
    await rolesRepository.create(userRole);

    // Assign role to user first
    await usersRepository.assignRole(
      user.id.toString(),
      userRole.id.toString()
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      roleId: userRole.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.message).toBe('Role removed from user successfully');
    }

    // Verify role was removed
    const userRoles = await usersRepository.findRolesByUserId(
      user.id.toString()
    );
    expect(userRoles).toHaveLength(0);
  });

  it('should not be able to remove role from non-existent user', async () => {
    const userRole = makeRole({ slug: 'user', level: 0 });

    await rolesRepository.create(userRole);

    const result = await sut.execute({
      userId: 'non-existent-user-id',
      roleId: userRole.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not be able to remove non-existent role', async () => {
    const user = makeUser();

    await usersRepository.create(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      roleId: 'non-existent-role-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RoleNotFoundError);
  });

  it('should remove role association even if user has no roles', async () => {
    const user = makeUser();
    const userRole = makeRole({ slug: 'user', level: 0 });

    await usersRepository.create(user);
    await rolesRepository.create(userRole);

    // Don't assign any role, just try to remove
    const result = await sut.execute({
      userId: user.id.toString(),
      roleId: userRole.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.message).toBe('Role removed from user successfully');
    }
  });
});
