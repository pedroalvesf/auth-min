import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { RefreshTokenRepository } from '../repositories/refresh-token-repository';
import { DevicesRepository } from '../repositories/devices-repository';
import { RefreshTokenNotFoundError } from './errors/refresh-token-not-found-error';
import { DeviceNotFoundError } from './errors/device-not-found-error';

interface RevokeDeviceSessionUseCaseRequest {
  deviceId: string;
  userId: string;
}

type RevokeDeviceSessionUseCaseResponse = Either<
  RefreshTokenNotFoundError | DeviceNotFoundError,
  {
    success: boolean;
  }
>;

@Injectable()
export class RevokeDeviceSessionUseCase {
  constructor(
    private refreshTokenRepository: RefreshTokenRepository,
    private devicesRepository: DevicesRepository
  ) {}

  async execute({
    deviceId,
    userId,
  }: RevokeDeviceSessionUseCaseRequest): Promise<RevokeDeviceSessionUseCaseResponse> {
    // Buscar todos os refresh tokens do dispositivo
    const refreshTokens = await this.refreshTokenRepository.findByDeviceId(
      deviceId
    );

    if (refreshTokens.length === 0) {
      return left(new RefreshTokenNotFoundError());
    }

    // Revogar todos os refresh tokens do dispositivo
    for (const refreshToken of refreshTokens) {
      if (!refreshToken.revoked) {
        refreshToken.revoke();
        await this.refreshTokenRepository.save(refreshToken);
      }
    }

    // Verificar se o dispositivo pertence ao usuário e desativá-lo
    const device = await this.devicesRepository.findById(deviceId);
    if (!device) {
      return left(new DeviceNotFoundError(deviceId));
    }

    // Verificar se o dispositivo pertence ao usuário
    if (device.userId.toString() !== userId) {
      return left(new DeviceNotFoundError(deviceId));
    }

    device.deactivate();
    await this.devicesRepository.save(device);

    return right({
      success: true,
    });
  }
}
