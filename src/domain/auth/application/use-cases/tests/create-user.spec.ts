import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository';
import { CreateUserUseCase } from '../create-user';
import { UserAlreadyExistsError } from '../errors/user-already-exists-error';

class FakeHashGenerator {
  async hash(plain: string): Promise<string> {
    return `hashed-${plain}`;
  }
}

let usersRepository: InMemoryUsersRepository;
let hashGenerator: FakeHashGenerator;
let sut: CreateUserUseCase;

describe('Create User', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    hashGenerator = new FakeHashGenerator();
    sut = new CreateUserUseCase(usersRepository, hashGenerator);
  });

  it('should be able to create a new user', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123456',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.user.name).toBe('John Doe');
      expect(result.value.user.email).toBe('john@example.com');
      expect(result.value.user.password).toBe('hashed-123456');
    }
    expect(usersRepository.items).toHaveLength(1);
  });

  it('should not be able to create a user with same email twice', async () => {
    const userEmail = 'john@example.com';

    await sut.execute({
      name: 'John Doe',
      email: userEmail,
      password: '123456',
    });

    const result = await sut.execute({
      name: 'John Doe 2',
      email: userEmail,
      password: '123456',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError);
  });
});
