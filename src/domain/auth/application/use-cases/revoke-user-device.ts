import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { DevicesRepository } from "../repositories/devices-repository";
import { RefreshTokenRepository } from "../repositories/refresh-token-repository";
import { AccessTokenRepository } from "../repositories/access-token-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
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
    private refreshTokenRepository: RefreshTokenRepository,
    private accessTokenRepository: AccessTokenRepository
  ) {}

  async execute({
    userId,
    deviceId,
  }: RevokeUserDeviceUseCaseRequest): Promise<RevokeUserDeviceUseCaseResponse> {
    const device = await this.devicesRepository.findById(
      new UniqueEntityID(deviceId)
    );

    if (!device) {
      return left(new DeviceNotFoundError());
    }

    // Verificar se o dispositivo pertence ao usuário
    if (device.userId.toString() !== userId) {
      return left(new UnauthorizedDeviceAccessError());
    }

    // Revogar todos os refresh tokens deste dispositivo
    const refreshTokens = await this.refreshTokenRepository.findByDeviceId(
      device.id
    );

    for (const refreshToken of refreshTokens) {
      if (!refreshToken.revoked) {
        refreshToken.revoke();
        await this.refreshTokenRepository.save(refreshToken);
      }
    }

    // Revogar todos os access tokens do usuário (mais seguro)
    await this.accessTokenRepository.revokeByUserId(new UniqueEntityID(userId));

    // Desativar o dispositivo
    device.active = false;
    await this.devicesRepository.save(device);

    return right(undefined);
  }
}
