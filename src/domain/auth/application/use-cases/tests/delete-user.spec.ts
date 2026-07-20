import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository';
import { InMemoryRefreshTokenRepository } from '@/test/repositories/in-memory-refresh-token-repository';
import { InMemoryDevicesRepository } from '@/test/repositories/in-memory-devices-repository';
import { makeUser } from '@/test/factories/make-user';
import { makeRefreshToken } from '@/test/factories/make-refresh-token';
import { makeDevice } from '@/test/factories/make-device';
import { DeleteUserUseCase } from '../delete-user';
import { UserNotFoundError } from '../errors/user-not-found-error';

let usersRepository: InMemoryUsersRepository;
let refreshTokenRepository: InMemoryRefreshTokenRepository;
let devicesRepository: InMemoryDevicesRepository;
let sut: DeleteUserUseCase;

describe('Delete User', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    devicesRepository = new InMemoryDevicesRepository();
    sut = new DeleteUserUseCase(
      usersRepository,
      refreshTokenRepository,
      devicesRepository
    );
  });

  it('should soft-delete a user', async () => {
    const user = makeUser();

    await usersRepository.create(user);

    const result = await sut.execute({
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.message).toBe('User deleted successfully');
    }

    // Soft-delete: some das buscas, mas o registro permanece marcado.
    const deletedUser = await usersRepository.findById(user.id.toString());
    expect(deletedUser).toBeNull();
    expect(usersRepository.items[0].isDeleted).toBe(true);
    expect(usersRepository.items[0].deletedAt).toBeInstanceOf(Date);
  });

  it('should not be able to delete a non-existent user', async () => {
    const result = await sut.execute({
      userId: 'non-existent-user-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should revoke refresh tokens and deactivate devices on delete', async () => {
    const user = makeUser();
    const refreshToken = makeRefreshToken({ userId: user.id });
    const device = makeDevice({ userId: user.id, active: true });

    await usersRepository.create(user);
    await refreshTokenRepository.create(refreshToken);
    await devicesRepository.create(device);

    const result = await sut.execute({
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);

    const tokens = await refreshTokenRepository.findByUserId(
      user.id.toString()
    );
    expect(tokens.every((t) => t.isRevoked())).toBe(true);

    const devices = await devicesRepository.findManyByUserId(
      user.id.toString()
    );
    expect(devices.every((d) => d.active === false)).toBe(true);
  });
});
