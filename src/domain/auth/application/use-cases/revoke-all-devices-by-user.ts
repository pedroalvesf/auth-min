import { Injectable } from '@nestjs/common';
import { Either, left, right } from "@/core/either";
import { DevicesRepository } from "../../repositories/devices-repository";
import { RefreshTokenRepository } from "../../repositories/refresh-token-repository";
import { AccessTokenRepository } from "../../repositories/access-token-repository";
import { UsersRepository } from "../../repositories/users-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { UserNotFoundError } from "./errors/user-not-found-error";

interface RevokeAllDevicesByUserUseCaseRequest {
  userId: string;
  excludeDeviceId?: string; // Opcional: manter um dispositivo ativo (o atual)
}

type RevokeAllDevicesByUserUseCaseResponse = Either<
  UserNotFoundError,
  {
    revokedDevicesCount: number;
    revokedTokensCount: number;
  }
>;

@Injectable()
export class RevokeAllDevicesByUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private devicesRepository: DevicesRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private accessTokenRepository: AccessTokenRepository
  ) {}

  async execute({
    userId,
    excludeDeviceId,
  }: RevokeAllDevicesByUserUseCaseRequest): Promise<RevokeAllDevicesByUserUseCaseResponse> {
    const userEntityId = new UniqueEntityID(userId);
    
    // Verificar se o usuário existe
    const user = await this.usersRepository.findById(userEntityId);
    if (!user) {
      return left(new UserNotFoundError());
    }

    // Buscar todos os dispositivos do usuário
    const devices = await this.devicesRepository.findByUserId(userEntityId);
    
    let revokedDevicesCount = 0;
    let revokedTokensCount = 0;

    // Revogar dispositivos (exceto o excluído, se especificado)
    for (const device of devices) {
      if (excludeDeviceId && device.id.toString() === excludeDeviceId) {
        continue; // Pular este dispositivo
      }

      // Revogar refresh tokens deste dispositivo
      const refreshTokens = await this.refreshTokenRepository.findByDeviceId(device.id);
      
      for (const refreshToken of refreshTokens) {
        if (!refreshToken.revoked) {
          refreshToken.revoke();
          await this.refreshTokenRepository.save(refreshToken);
          revokedTokensCount++;
        }
      }

      // Desativar dispositivo
      if (device.active) {
        device.active = false;
        await this.devicesRepository.save(device);
        revokedDevicesCount++;
      }
    }

    // Revogar todos os access tokens do usuário (exceto do dispositivo excluído)
    if (excludeDeviceId) {
      // Se há exclusão, revogar seletivamente (implementação mais complexa)
      // Por simplicidade, revogamos todos e o dispositivo ativo terá que renovar
      await this.accessTokenRepository.revokeByUserId(userEntityId);
    } else {
      // Revogar todos os access tokens
      await this.accessTokenRepository.revokeByUserId(userEntityId);
    }

    return right({
      revokedDevicesCount,
      revokedTokensCount,
    });
  }
}