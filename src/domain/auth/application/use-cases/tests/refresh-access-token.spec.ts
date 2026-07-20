import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository';
import { InMemoryRefreshTokenRepository } from '@/test/repositories/in-memory-refresh-token-repository';
import { FakeEncrypter } from '@/test/cryptography/fake-encrypter';
import { makeUser } from '@/test/factories/make-user';
import { makeRefreshToken } from '@/test/factories/make-refresh-token';
import { RefreshAccessTokenUseCase } from '../refresh-access-token';
import { RefreshTokenNotFoundError } from '../errors/refresh-token-not-found-error';
import { RefreshTokenExpiredError } from '../errors/refresh-token-expired-error';
import { RefreshTokenReuseError } from '../errors/refresh-token-reuse-error';
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

  it('should rotate the refresh token and revoke the old one', async () => {
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
      // Rotação: o token retornado é NOVO, diferente do apresentado.
      expect(result.value.accessToken).toEqual(expect.any(String));
      expect(result.value.refreshToken).not.toEqual(refreshToken.token);

      const payload = JSON.parse(result.value.accessToken);
      expect(payload).toHaveProperty('sub', user.id.toString());
      expect(payload).toHaveProperty('deviceId', 'device-1');
    }

    // O token antigo foi revogado e um novo criado na mesma família.
    expect(refreshTokenRepository.items).toHaveLength(2);
    const oldToken = refreshTokenRepository.items.find(
      (t) => t.token === refreshToken.token
    );
    const newToken = refreshTokenRepository.items.find(
      (t) => t.token !== refreshToken.token
    );
    expect(oldToken?.isRevoked()).toBe(true);
    expect(newToken?.isRevoked()).toBe(false);
    expect(newToken?.familyId.toString()).toEqual(
      refreshToken.familyId.toString()
    );
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

  it('should detect reuse of a revoked token and revoke the whole family', async () => {
    const user = makeUser();
    const familyId = new UniqueEntityID('family-42');

    // Token já revogado (ex.: já rotacionado antes).
    const revokedToken = makeRefreshToken({
      userId: user.id,
      familyId,
      revokedAt: new Date(),
    });

    // Token ativo da mesma família (o "atual" legítimo).
    const activeToken = makeRefreshToken({
      userId: user.id,
      familyId,
    });

    await usersRepository.create(user);
    await refreshTokenRepository.create(revokedToken);
    await refreshTokenRepository.create(activeToken);

    // Apresentar o token revogado indica reuso/replay.
    const result = await sut.execute({
      refreshToken: revokedToken.token,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RefreshTokenReuseError);

    // A família inteira deve ficar revogada.
    const family = await refreshTokenRepository.findByFamilyId(
      familyId.toString()
    );
    expect(family.every((t) => t.isRevoked())).toBe(true);
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
