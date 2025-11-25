import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository';
import { InMemoryRolesRepository } from '@/test/repositories/in-memory-roles-repository';
import { makeUser } from '@/test/factories/make-user';
import { makeRole } from '@/test/factories/make-role';
import { AssignRoleToUserUseCase } from '../assign-role-to-user';
import { UserNotFoundError } from '../errors/user-not-found-error';
import { RoleNotFoundError } from '../errors/role-not-found-error';

let usersRepository: InMemoryUsersRepository;
let rolesRepository: InMemoryRolesRepository;
let sut: AssignRoleToUserUseCase;

describe('Assign Role to User', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    rolesRepository = new InMemoryRolesRepository();
    sut = new AssignRoleToUserUseCase(usersRepository, rolesRepository);
  });

  it('should be able to assign a role to a user', async () => {
    const user = makeUser();
    const role = makeRole();

    await usersRepository.create(user);
    await rolesRepository.create(role);

    const result = await sut.execute({
      userId: user.id.toString(),
      roleId: role.id.toString(),
      assignedBy: 'admin-id',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.success).toBe(true);
    }

    // Verify the role was assigned
    const userRoles = usersRepository.userRoles.filter(
      (ur) => ur.userId === user.id.toString()
    );
    expect(userRoles).toHaveLength(1);
    expect(userRoles[0].roleId).toBe(role.id.toString());
  });

  it('should not be able to assign role to non-existent user', async () => {
    const role = makeRole();
    await rolesRepository.create(role);

    const result = await sut.execute({
      userId: 'non-existent-user',
      roleId: role.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not be able to assign non-existent role to user', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      roleId: 'non-existent-role',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RoleNotFoundError);
  });
});
