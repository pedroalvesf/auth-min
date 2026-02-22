import { Injectable, Inject } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { Device } from '../../enterprise/entities/device';
import { RefreshToken } from '../../enterprise/entities/refresh-token';
import { AccessToken } from '../../enterprise/entities/access-token';
import { User } from '../../enterprise/entities/user';
import { HashComparer } from '../cryptography/hash-comparer';
import { Encrypter } from '../cryptography/encrypter';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { DevicesRepository } from '../repositories/devices-repository';
import { UsersRepository } from '../repositories/users-repository';
import { RefreshTokenRepository } from '../repositories/refresh-token-repository';
import { WrongCredentialsError } from './errors/wrong-credentials-error';

interface AuthenticateDeviceUseCaseRequest {
  password: string;
  device: Device;
}

type AuthenticateDeviceUseCaseResponse = Either<
  WrongCredentialsError,
  {
    accessToken: AccessToken;
    refreshToken: RefreshToken;
  }
>;

@Injectable()
export class AuthenticateDeviceUseCase {
  constructor(
    private devicesRepository: DevicesRepository,
    private usersRepository: UsersRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  async execute({
    password,
    device,
  }: AuthenticateDeviceUseCaseRequest): Promise<AuthenticateDeviceUseCaseResponse> {
    const startTime = Date.now();
    const userId = device.userId.toString();

    this.logger.info('Authentication attempt started', {
      context: 'AUTH',
      action: 'device_authentication_start',
      userId,
      deviceInfo: {
        type: device.type,
        browser: device.browser,
        os: device.operatingSystem,
        ip: device.ipAddress,
        location: device.location,
      },
    });

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      this.logger.warn('Authentication failed - user not found', {
        context: 'AUTH',
        action: 'device_authentication_failed',
        userId,
        reason: 'user_not_found',
        duration: Date.now() - startTime,
      });
      return left(new WrongCredentialsError());
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      this.logger.warn('Authentication failed - invalid password', {
        context: 'AUTH',
        action: 'device_authentication_failed',
        userId,
        email: user.email,
        reason: 'invalid_password',
        duration: Date.now() - startTime,
      });
      return left(new WrongCredentialsError());
    }

    const result = await this.authenticateUser(user, device);

    this.logger.info('Authentication successful', {
      context: 'AUTH',
      action: 'device_authentication_success',
      userId,
      deviceId: result.refreshToken.deviceId.toString(),
      email: user.email,
      duration: Date.now() - startTime,
    });

    return right(result);
  }

  private async authenticateUser(user: User, device: Device) {
    const updatedDevice = await this.getOrCreateDevice(device);

    const { accessToken, refreshToken } = await this.encrypter.encrypt({
      sub: user.id.toString(),
      deviceId: updatedDevice.id.toString(),
    });

    const accessTokenEntity = AccessToken.create({
      userId: new UniqueEntityID(user.id.toString()),
      token: accessToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      revoked: false,
    });

    const refreshTokenEntity = RefreshToken.create({
      userId: new UniqueEntityID(user.id.toString()),
      deviceId: updatedDevice.id,
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
    });

    await this.refreshTokenRepository.create(refreshTokenEntity);

    user.updateLastLogin();
    await this.usersRepository.save(user);

    return {
      accessToken: accessTokenEntity,
      refreshToken: refreshTokenEntity,
    };
  }

  private async getOrCreateDevice(device: Device): Promise<Device> {
    const repoDevice = await this.devicesRepository.findByUserIdIp(
      device.userId.toString(),
      device.ipAddress
    );

    if (
      !repoDevice ||
      repoDevice.browser !== device.browser ||
      repoDevice.operatingSystem !== device.operatingSystem ||
      repoDevice.type !== device.type
    ) {
      device.lastLogin = new Date();
      await this.devicesRepository.create(device);
      return device;
    }

    repoDevice.lastLogin = new Date();
    await this.devicesRepository.save(repoDevice);

    return repoDevice;
  }
}
