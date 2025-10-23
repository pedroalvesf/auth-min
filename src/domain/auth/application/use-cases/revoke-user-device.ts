import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { DevicesRepository } from "../repositories/devices-repository";
import { RefreshTokenRepository } from "../repositories/refresh-token-repository";
import { DeviceNotFoundError } from "./errors/device-not-found-error";
import { UnauthorizedDeviceAccessError } from "./errors/unauthorized-device-access-error";

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

    // Verificar se o dispositivo pertence ao usuário
    if (device.userId.toString() !== userId) {
      return left(new UnauthorizedDeviceAccessError());
    }

    // Revogar todos os refresh tokens deste dispositivo
    const refreshTokens = await this.refreshTokenRepository.findByDeviceId(
      device.id.toString()
    );

    for (const refreshToken of refreshTokens) {
      if (!refreshToken.revoked) {
        refreshToken.revoke();
        await this.refreshTokenRepository.save(refreshToken);
      }
    }

    // Access tokens são revogados automaticamente quando o refresh token é revogado

    // Desativar o dispositivo
    device.active = false;
    await this.devicesRepository.save(device);

    return right(undefined);
  }
}
