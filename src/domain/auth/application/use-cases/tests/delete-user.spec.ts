import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository';
import { makeUser } from '@/test/factories/make-user';
import { DeleteUserUseCase } from '../delete-user';
import { UserNotFoundError } from '../errors/user-not-found-error';

let usersRepository: InMemoryUsersRepository;
let sut: DeleteUserUseCase;

describe('Delete User', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new DeleteUserUseCase(usersRepository);
  });

  it('should be able to delete a user', async () => {
    const user = makeUser();

    await usersRepository.create(user);

    const result = await sut.execute({
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.message).toBe('User deleted successfully');
    }

    // Verify user was deleted
    const deletedUser = await usersRepository.findById(user.id.toString());
    expect(deletedUser).toBeNull();
  });

  it('should not be able to delete a non-existent user', async () => {
    const result = await sut.execute({
      userId: 'non-existent-user-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should remove all user roles when deleting user', async () => {
    const user = makeUser();

    await usersRepository.create(user);

    // Add some mock roles to the user
    await usersRepository.assignRole(user.id.toString(), 'role-1');
    await usersRepository.assignRole(user.id.toString(), 'role-2');

    // Verify roles were assigned
    const userRoles = await usersRepository.findRolesByUserId(
      user.id.toString()
    );
    expect(userRoles).toHaveLength(0); // Will be 0 because roles don't exist in mock data

    // But userRoles association should exist
    expect(
      usersRepository.userRoles.filter((ur) => ur.userId === user.id.toString())
    ).toHaveLength(2);

    const result = await sut.execute({
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);

    // Verify user roles were removed
    expect(
      usersRepository.userRoles.filter((ur) => ur.userId === user.id.toString())
    ).toHaveLength(0);
  });
});
