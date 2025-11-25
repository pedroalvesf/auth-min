import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository';
import { FakeTokenValidator } from '@/test/cryptography/fake-token-validator';
import { makeUser } from '@/test/factories/make-user';
import { ValidateTokenUseCase } from '../validate-token';
import { InvalidTokenError } from '../errors/invalid-token-error';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

let usersRepository: InMemoryUsersRepository;
let tokenValidator: FakeTokenValidator;
let sut: ValidateTokenUseCase;

describe('Validate Token', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    tokenValidator = new FakeTokenValidator();
    sut = new ValidateTokenUseCase(usersRepository, tokenValidator);
  });

  it('should be able to validate a valid token', async () => {
    const user = makeUser(
      {
        email: 'john@example.com',
        name: 'John Doe',
      },
      new UniqueEntityID('user-1')
    );

    await usersRepository.create(user);

    const result = await sut.execute('valid-token');

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual({
        userId: 'user-1',
        email: 'john@example.com',
        name: 'John Doe',
      });
    }
  });

  it('should not be able to validate an invalid token', async () => {
    const result = await sut.execute('invalid-token');

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });

  it('should not be able to validate an expired token', async () => {
    const result = await sut.execute('expired-token');

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });

  it('should not be able to validate a malformed token', async () => {
    const result = await sut.execute('malformed-token');

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });

  it('should not be able to validate a refresh token', async () => {
    const user = makeUser(
      {
        email: 'john@example.com',
      },
      new UniqueEntityID('user-1')
    );

    await usersRepository.create(user);

    const result = await sut.execute('refresh-token');

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });

  it('should not be able to validate token without sub', async () => {
    const result = await sut.execute('token-without-sub');

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });

  it('should not be able to validate token for non-existent user', async () => {
    const result = await sut.execute('token-non-existent-user');

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidTokenError);
  });
});
