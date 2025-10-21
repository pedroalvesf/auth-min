import { Either, left, right } from "@/core/either";

import { DevicesRepository } from "@/domain/auth/application/repositories/devices-repository";
import { RefreshTokenRepository } from "@/domain/auth/application/repositories/refresh-token-repository";
import { UsersRepository } from "@/domain/auth/application/repositories/users-repository";

import { DeviceNotFoundError } from "./errors/device-not-found-error";
import { UserNotFoundError } from "./errors/user-not-found-error";
import { Injectable } from "@nestjs/common";
import { UnauthorizedDeviceAccessError } from "./errors/unauthorized-device-access-error";

interface RevokeDeviceSessionUseCaseRequest {
  userId: string;
  deviceId: string;
}

type RevokeDeviceSessionUseCaseResponse = Either<
  UserNotFoundError | DeviceNotFoundError,
  {
    success: boolean;
  }
>;

@Injectable()
export class RevokeDeviceSessionUseCase {
  constructor(
    private devicesRepository: DevicesRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private usersRepository: UsersRepository
  ) {}

  async execute({
    userId,
    deviceId,
  }: RevokeDeviceSessionUseCaseRequest): Promise<RevokeDeviceSessionUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    const device = await this.devicesRepository.findById(deviceId);
    if (!device || device.userId.toString() !== userId) {
      return left(new DeviceNotFoundError(deviceId));
    }
    const refreshTokens = await this.refreshTokenRepository.findByDeviceId(
      deviceId
    );

    for (const token of refreshTokens) {
      token.revoke();
      await this.refreshTokenRepository.delete(token.id.toString());
    }

    device.active = false;
    await this.devicesRepository.save(device);

    user.sign();
    await this.usersRepository.save(user);

    return right({ success: true });
  }
}
