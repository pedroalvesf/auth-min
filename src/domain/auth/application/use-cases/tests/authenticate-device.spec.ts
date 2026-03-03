import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository';
import { InMemoryDevicesRepository } from '@/test/repositories/in-memory-devices-repository';
import { InMemoryRefreshTokenRepository } from '@/test/repositories/in-memory-refresh-token-repository';
import { FakeHashComparer } from '@/test/cryptography/fake-hash-comparer';
import { FakeEncrypter } from '@/test/cryptography/fake-encrypter';
import { makeUser } from '@/test/factories/make-user';
import { makeDevice } from '@/test/factories/make-device';
import { AuthenticateDeviceUseCase } from '../authenticate-device';
import { WrongCredentialsError } from '../errors/wrong-credentials-error';

let usersRepository: InMemoryUsersRepository;
let devicesRepository: InMemoryDevicesRepository;
let refreshTokenRepository: InMemoryRefreshTokenRepository;
let hashComparer: FakeHashComparer;
let encrypter: FakeEncrypter;
let mockLogger: unknown;
let sut: AuthenticateDeviceUseCase;

describe('Authenticate Device', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    devicesRepository = new InMemoryDevicesRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    hashComparer = new FakeHashComparer();
    encrypter = new FakeEncrypter();
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };
    sut = new AuthenticateDeviceUseCase(
      devicesRepository,
      usersRepository,
      refreshTokenRepository,
      hashComparer,
      encrypter,
      mockLogger as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  });

  it('should be able to authenticate a device with valid credentials', async () => {
    const user = makeUser({
      email: 'john@example.com',
      password: '123456', // Same length as the password we'll use
    });

    const device = makeDevice({
      userId: user.id,
    });

    await usersRepository.create(user);

    const result = await sut.execute({
      password: '123456', // Same length as user password (fake hash comparison)
      device,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.accessToken).toBeDefined();
      expect(result.value.refreshToken).toBeDefined();
      expect(result.value.accessToken.userId).toEqual(user.id);
      expect(result.value.refreshToken.userId).toEqual(user.id);
    }

    // Verify device was created
    expect(devicesRepository.items).toHaveLength(1);

    // Verify refresh token was saved
    expect(refreshTokenRepository.items).toHaveLength(1);
  });

  it('should not authenticate with wrong password', async () => {
    const user = makeUser({
      email: 'john@example.com',
      password: '123456',
    });

    const device = makeDevice({
      userId: user.id,
    });

    await usersRepository.create(user);

    const result = await sut.execute({
      password: 'wrongpass', // Different length = fake hash will fail
      device,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });

  it('should not authenticate non-existent user', async () => {
    const device = makeDevice();

    const result = await sut.execute({
      password: '123456',
      device,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });

  it('should reuse existing device if same browser and OS', async () => {
    const user = makeUser({
      email: 'john@example.com',
      password: '123456',
    });

    const existingDevice = makeDevice({
      userId: user.id,
      ipAddress: '192.168.1.100',
      browser: 'Chrome 120.0',
      operatingSystem: 'Windows 11',
    });

    const newDevice = makeDevice({
      userId: user.id,
      ipAddress: '192.168.1.100', // Same IP
      browser: 'Chrome 120.0', // Same browser
      operatingSystem: 'Windows 11', // Same OS
    });

    await usersRepository.create(user);
    await devicesRepository.create(existingDevice);

    const result = await sut.execute({
      password: '123456',
      device: newDevice,
    });

    expect(result.isRight()).toBe(true);

    // Should still have only one device (reused existing)
    expect(devicesRepository.items).toHaveLength(1);
    expect(devicesRepository.items[0].lastLogin).toBeDefined();
  });

  it('should create new device if browser or OS differs', async () => {
    const user = makeUser({
      email: 'john@example.com',
      password: '123456',
    });

    const existingDevice = makeDevice({
      userId: user.id,
      ipAddress: '192.168.1.100',
      browser: 'Chrome 120.0',
      operatingSystem: 'Windows 11',
    });

    const newDevice = makeDevice({
      userId: user.id,
      ipAddress: '192.168.1.100', // Same IP
      browser: 'Firefox 121.0', // Different browser
      operatingSystem: 'Windows 11',
    });

    await usersRepository.create(user);
    await devicesRepository.create(existingDevice);

    const result = await sut.execute({
      password: '123456',
      device: newDevice,
    });

    expect(result.isRight()).toBe(true);

    // Should have two devices now
    expect(devicesRepository.items).toHaveLength(2);
  });
});
