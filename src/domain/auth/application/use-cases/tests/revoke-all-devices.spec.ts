import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository';
import { InMemoryDevicesRepository } from '@/test/repositories/in-memory-devices-repository';
import { InMemoryRefreshTokenRepository } from '@/test/repositories/in-memory-refresh-token-repository';
import { makeUser } from '@/test/factories/make-user';
import { makeDevice } from '@/test/factories/make-device';
import { makeRefreshToken } from '@/test/factories/make-refresh-token';
import { RevokeAllDevicesUseCase } from '../revoke-all-devices';
import { UserNotFoundError } from '../errors/user-not-found-error';

let usersRepository: InMemoryUsersRepository;
let devicesRepository: InMemoryDevicesRepository;
let refreshTokenRepository: InMemoryRefreshTokenRepository;
let sut: RevokeAllDevicesUseCase;

describe('Revoke All Devices', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    devicesRepository = new InMemoryDevicesRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    sut = new RevokeAllDevicesUseCase(
      refreshTokenRepository,
      usersRepository,
      devicesRepository
    );
  });

  it('should be able to revoke all devices from a user', async () => {
    const user = makeUser();
    const device1 = makeDevice({ userId: user.id });
    const device2 = makeDevice({ userId: user.id });
    const device3 = makeDevice({ userId: user.id });

    await usersRepository.create(user);
    await devicesRepository.create(device1);
    await devicesRepository.create(device2);
    await devicesRepository.create(device3);

    const result = await sut.execute({
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual({ success: true });
    }

    // Verify all devices are deactivated
    const userDevices = await devicesRepository.findManyByUserId(
      user.id.toString()
    );
    expect(userDevices).toHaveLength(3);
    userDevices.forEach((device) => {
      expect(device.active).toBe(false);
    });
  });

  it('should be able to revoke all refresh tokens from a user', async () => {
    const user = makeUser();
    const device1 = makeDevice({ userId: user.id });
    const device2 = makeDevice({ userId: user.id });

    const refreshToken1 = makeRefreshToken({
      userId: user.id,
      deviceId: device1.id,
    });
    const refreshToken2 = makeRefreshToken({
      userId: user.id,
      deviceId: device2.id,
    });

    await usersRepository.create(user);
    await devicesRepository.create(device1);
    await devicesRepository.create(device2);
    await refreshTokenRepository.create(refreshToken1);
    await refreshTokenRepository.create(refreshToken2);

    const result = await sut.execute({
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual({ success: true });
    }

    // Verify all refresh tokens are deleted
    const userRefreshTokens = await refreshTokenRepository.findByUserId(
      user.id.toString()
    );
    expect(userRefreshTokens).toHaveLength(0);
  });

  it('should not be able to revoke devices when user does not exist', async () => {
    const result = await sut.execute({
      userId: 'non-existent-user',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should not fail when user has no devices', async () => {
    const user = makeUser();

    await usersRepository.create(user);

    const result = await sut.execute({
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual({ success: true });
    }
  });
});
