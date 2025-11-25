import { Either, left, right } from '@/core/either';

import { DevicesRepository } from '@/domain/auth/application/repositories/devices-repository';
import { RefreshTokenRepository } from '@/domain/auth/application/repositories/refresh-token-repository';
import { UsersRepository } from '@/domain/auth/application/repositories/users-repository';

import { DeviceNotFoundError } from './errors/device-not-found-error';
import { UserNotFoundError } from './errors/user-not-found-error';
import { Injectable } from '@nestjs/common';

interface RevokeAllDevicesUseCaseRequest {
  userId: string;
}

type RevokeAllDevicesUseCaseResponse = Either<
  UserNotFoundError | DeviceNotFoundError,
  {
    success: boolean;
  }
>;

@Injectable()
export class RevokeAllDevicesUseCase {
  constructor(
    private refreshTokenRepository: RefreshTokenRepository,
    private usersRepository: UsersRepository,
    private devicesRepository: DevicesRepository
  ) {}

  async execute({
    userId,
  }: RevokeAllDevicesUseCaseRequest): Promise<RevokeAllDevicesUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    const devices = await this.devicesRepository.findManyByUserId(userId);

    const refreshTokens = await this.refreshTokenRepository.findByUserId(
      userId
    );

    for (const token of refreshTokens) {
      await this.refreshTokenRepository.delete(token.id.toString());
    }

    for (const device of devices) {
      device.active = false;
      await this.devicesRepository.save(device);
    }

    return right({ success: true });
  }
}
