import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository';
import { makeUser } from '@/test/factories/make-user';
import { GetUserByIdUseCase } from '../get-user-by-id';
import { UserNotFoundError } from '../errors/user-not-found-error';

let usersRepository: InMemoryUsersRepository;
let sut: GetUserByIdUseCase;

describe('Get User By Id', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new GetUserByIdUseCase(usersRepository);
  });

  it('should be able to get a user by id', async () => {
    const user = makeUser({
      name: 'John Doe',
      email: 'john@example.com',
    });

    await usersRepository.create(user);

    const result = await sut.execute({
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.user.id).toEqual(user.id);
      expect(result.value.user.name).toBe('John Doe');
      expect(result.value.user.email).toBe('john@example.com');
    }
  });

  it('should not be able to get a non-existent user', async () => {
    const result = await sut.execute({
      userId: 'non-existent-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });
});
