import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { DevicesRepository } from '../repositories/devices-repository';
import { RefreshTokenRepository } from '../repositories/refresh-token-repository';
import { DeviceNotFoundError } from './errors/device-not-found-error';
import { UnauthorizedDeviceAccessError } from './errors/unauthorized-device-access-error';

interface RevokeUserDeviceUseCaseRequest {
  userId: string;
  deviceId: string;
}

type RevokeUserDeviceUseCaseResponse = Either<
  DeviceNotFoundError | UnauthorizedDeviceAccessError,
  void
>;

@Injectable()
export class RevokeUserDeviceUseCase {
  constructor(
    private devicesRepository: DevicesRepository,
    private refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute({
    userId,
    deviceId,
  }: RevokeUserDeviceUseCaseRequest): Promise<RevokeUserDeviceUseCaseResponse> {
    const device = await this.devicesRepository.findById(deviceId);

    if (!device) {
      return left(new DeviceNotFoundError(deviceId));
    }

    // Check if the device belongs to the user
    if (device.userId.toString() !== userId) {
      return left(new UnauthorizedDeviceAccessError());
    }

    // Revoke all refresh tokens for this device
    const refreshTokens = await this.refreshTokenRepository.findByDeviceId(
      device.id.toString()
    );

    for (const refreshToken of refreshTokens) {
      if (!refreshToken.revoked) {
        refreshToken.revoke();
        await this.refreshTokenRepository.save(refreshToken);
      }
    }

    // Access tokens are automatically revoked when the refresh token is revoked

    // Deactivate the device
    device.active = false;
    await this.devicesRepository.save(device);

    return right(undefined);
  }
}
