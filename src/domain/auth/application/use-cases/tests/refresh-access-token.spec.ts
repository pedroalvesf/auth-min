import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository';
import { InMemoryRefreshTokenRepository } from '@/test/repositories/in-memory-refresh-token-repository';
import { FakeEncrypter } from '@/test/cryptography/fake-encrypter';
import { makeUser } from '@/test/factories/make-user';
import { makeRefreshToken } from '@/test/factories/make-refresh-token';
import { RefreshAccessTokenUseCase } from '../refresh-access-token';
import { RefreshTokenNotFoundError } from '../errors/refresh-token-not-found-error';
import { RefreshTokenExpiredError } from '../errors/refresh-token-expired-error';
import { UserNotFoundError } from '../errors/user-not-found-error';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

let usersRepository: InMemoryUsersRepository;
let refreshTokenRepository: InMemoryRefreshTokenRepository;
let encrypter: FakeEncrypter;
let sut: RefreshAccessTokenUseCase;

describe('Refresh Access Token', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    encrypter = new FakeEncrypter();
    sut = new RefreshAccessTokenUseCase(
      usersRepository,
      refreshTokenRepository,
      encrypter
    );
  });

  it('should be able to refresh access token with valid refresh token', async () => {
    const user = makeUser();
    const refreshToken = makeRefreshToken({
      userId: user.id,
      deviceId: new UniqueEntityID('device-1'),
    });

    await usersRepository.create(user);
    await refreshTokenRepository.create(refreshToken);

    const result = await sut.execute({
      refreshToken: refreshToken.token,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: refreshToken.token,
      });
      // FakeEncrypter returns JSON.stringify of the payload
      const payload = JSON.parse(result.value.accessToken);
      expect(payload).toHaveProperty('sub', user.id.toString());
      expect(payload).toHaveProperty('deviceId', 'device-1');
    }
  });

  it('should not be able to refresh access token with non-existent refresh token', async () => {
    const result = await sut.execute({
      refreshToken: 'non-existent-token',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RefreshTokenNotFoundError);
  });

  it('should not be able to refresh access token with expired refresh token', async () => {
    const user = makeUser();
    const expiredRefreshToken = makeRefreshToken({
      userId: user.id,
      expiresAt: new Date(Date.now() - 1000), // 1 second ago
    });

    await usersRepository.create(user);
    await refreshTokenRepository.create(expiredRefreshToken);

    const result = await sut.execute({
      refreshToken: expiredRefreshToken.token,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RefreshTokenExpiredError);
  });

  it('should not be able to refresh access token with revoked refresh token', async () => {
    const user = makeUser();
    const refreshToken = makeRefreshToken({
      userId: user.id,
      revoked: true,
      revokedAt: new Date(),
    });

    await usersRepository.create(user);
    await refreshTokenRepository.create(refreshToken);

    const result = await sut.execute({
      refreshToken: refreshToken.token,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RefreshTokenExpiredError);
  });

  it('should not be able to refresh access token when user does not exist', async () => {
    const refreshToken = makeRefreshToken({
      userId: new UniqueEntityID('non-existent-user'),
    });

    await refreshTokenRepository.create(refreshToken);

    const result = await sut.execute({
      refreshToken: refreshToken.token,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });
});
