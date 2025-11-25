import { InMemoryDevicesRepository } from '@/test/repositories/in-memory-devices-repository';
import { InMemoryRefreshTokenRepository } from '@/test/repositories/in-memory-refresh-token-repository';
import { makeUser } from '@/test/factories/make-user';
import { makeDevice } from '@/test/factories/make-device';
import { makeRefreshToken } from '@/test/factories/make-refresh-token';
import { RevokeUserDeviceUseCase } from '../revoke-user-device';
import { DeviceNotFoundError } from '../errors/device-not-found-error';
import { UnauthorizedDeviceAccessError } from '../errors/unauthorized-device-access-error';

let devicesRepository: InMemoryDevicesRepository;
let refreshTokenRepository: InMemoryRefreshTokenRepository;
let sut: RevokeUserDeviceUseCase;

describe('Revoke User Device', () => {
  beforeEach(() => {
    devicesRepository = new InMemoryDevicesRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    sut = new RevokeUserDeviceUseCase(
      devicesRepository,
      refreshTokenRepository
    );
  });

  it('should be able to revoke a specific device from user', async () => {
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
      userId: user.id.toString(),
      deviceId: device.id.toString(),
    });

    expect(result.isRight()).toBe(true);

    // Verify device is deactivated
    const updatedDevice = await devicesRepository.findById(
      device.id.toString()
    );
    expect(updatedDevice?.active).toBe(false);

    // Verify all refresh tokens associated with device are revoked
    const deviceRefreshTokens = await refreshTokenRepository.findByDeviceId(
      device.id.toString()
    );
    deviceRefreshTokens.forEach((token) => {
      expect(token.revoked).toBe(true);
      expect(token.revokedAt).toBeInstanceOf(Date);
    });
  });

  it('should be able to revoke refresh tokens associated with the device', async () => {
    const user = makeUser();
    const device = makeDevice({ userId: user.id });
    const refreshToken = makeRefreshToken({
      userId: user.id,
      deviceId: device.id,
    });

    await devicesRepository.create(device);
    await refreshTokenRepository.create(refreshToken);

    const result = await sut.execute({
      userId: user.id.toString(),
      deviceId: device.id.toString(),
    });

    expect(result.isRight()).toBe(true);

    // Verify refresh token is revoked
    const updatedToken = await refreshTokenRepository.findById(
      refreshToken.id.toString()
    );
    expect(updatedToken?.revoked).toBe(true);
  });

  it('should not be able to revoke device when device does not exist', async () => {
    const user = makeUser();

    const result = await sut.execute({
      userId: user.id.toString(),
      deviceId: 'non-existent-device',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DeviceNotFoundError);
  });

  it('should not be able to revoke device when user is not the owner', async () => {
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
      userId: user.id.toString(),
      deviceId: device.id.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedDeviceAccessError);

    // Verify device and tokens are not affected
    const updatedDevice = await devicesRepository.findById(
      device.id.toString()
    );
    expect(updatedDevice?.active).toBe(true);

    const updatedToken = await refreshTokenRepository.findById(
      refreshToken.id.toString()
    );
    expect(updatedToken?.revoked).toBe(false);
  });
});
