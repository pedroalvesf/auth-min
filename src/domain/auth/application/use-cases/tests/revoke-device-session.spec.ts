import { InMemoryDevicesRepository } from '@/test/repositories/in-memory-devices-repository';
import { InMemoryRefreshTokenRepository } from '@/test/repositories/in-memory-refresh-token-repository';
import { makeUser } from '@/test/factories/make-user';
import { makeDevice } from '@/test/factories/make-device';
import { makeRefreshToken } from '@/test/factories/make-refresh-token';
import { RevokeDeviceSessionUseCase } from '../revoke-device-session';
import { RefreshTokenNotFoundError } from '../errors/refresh-token-not-found-error';
import { DeviceNotFoundError } from '../errors/device-not-found-error';

let devicesRepository: InMemoryDevicesRepository;
let refreshTokenRepository: InMemoryRefreshTokenRepository;
let sut: RevokeDeviceSessionUseCase;

describe('Revoke Device Session', () => {
  beforeEach(() => {
    devicesRepository = new InMemoryDevicesRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    sut = new RevokeDeviceSessionUseCase(
      refreshTokenRepository,
      devicesRepository
    );
  });

  it('should be able to revoke session of a specific device', async () => {
    const user = makeUser();
    const device = makeDevice({ userId: user.id });
    const refreshToken1 = makeRefreshToken({
      userId: user.id,
      deviceId: device.id,
    });
    const refreshToken2 = makeRefreshToken({
      userId: user.id,
      deviceId: device.id,
    });

    await devicesRepository.create(device);
    await refreshTokenRepository.create(refreshToken1);
    await refreshTokenRepository.create(refreshToken2);

    const result = await sut.execute({
      deviceId: device.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toEqual({ success: true });
    }

    // Verify device is deactivated
    const updatedDevice = await devicesRepository.findById(
      device.id.toString()
    );
    expect(updatedDevice?.active).toBe(false);

    // Verify all refresh tokens are revoked
    const deviceRefreshTokens = await refreshTokenRepository.findByDeviceId(
      device.id.toString()
    );
    deviceRefreshTokens.forEach((token) => {
      expect(token.revoked).toBe(true);
      expect(token.revokedAt).toBeInstanceOf(Date);
    });
  });

  it('should be able to revoke refresh tokens of the device', async () => {
    const user = makeUser();
    const device = makeDevice({ userId: user.id });
    const refreshToken = makeRefreshToken({
      userId: user.id,
      deviceId: device.id,
    });

    await devicesRepository.create(device);
    await refreshTokenRepository.create(refreshToken);

    const result = await sut.execute({
      deviceId: device.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);

    // Verify refresh token is revoked
    const updatedToken = await refreshTokenRepository.findById(
      refreshToken.id.toString()
    );
    expect(updatedToken?.revoked).toBe(true);
  });

  it('should not be able to revoke session when device does not exist', async () => {
    const user = makeUser();

    const result = await sut.execute({
      deviceId: 'non-existent-device',
      userId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RefreshTokenNotFoundError);
  });

  it('should not be able to revoke session when user is not the device owner', async () => {
    const user = makeUser();
    const anotherUser = makeUser();
    const device = makeDevice({ userId: anotherUser.id });
    const refreshToken = makeRefreshToken({
      userId: anotherUser.id,
      deviceId: device.id,
    });

    await devicesRepository.create(device);
    await refreshTokenRepository.create(refreshToken);

    const result = await sut.execute({
      deviceId: device.id.toString(),
      userId: user.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DeviceNotFoundError);

    // Verify device is not affected
    const updatedDevice = await devicesRepository.findById(
      device.id.toString()
    );
    expect(updatedDevice?.active).toBe(true);
  });
});
