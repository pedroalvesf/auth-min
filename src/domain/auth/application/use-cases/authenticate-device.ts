import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { Device } from "../../enterprise/entities/device";
import { RefreshToken } from "../../enterprise/entities/refresh-token";
import { AccessToken } from "../../enterprise/entities/access-token";
import { User } from "../../enterprise/entities/user";
import { HashComparer } from "../cryptography/hash-comparer";
import { Encrypter } from "../cryptography/encrypter";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import { InvalidCredentialsError } from "./errors/invalid-credentials-error";
import { DevicesRepository } from "../repositories/devices-repository";
import { UsersRepository } from "../repositories/users-repository";
import { RefreshTokenRepository } from "../repositories/refresh-token-repository";
import { WrongCredentialsError } from "./errors/wrong-credentials-error";

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
    private encrypter: Encrypter
  ) {}

  async execute({
    password,
    device,
  }: AuthenticateDeviceUseCaseRequest): Promise<AuthenticateDeviceUseCaseResponse> {
    const user = await this.usersRepository.findById(device.userId.toString());
    if (!user) {
      return left(new WrongCredentialsError());
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.password
    );
    if (isPasswordValid) {
      const result = await this.authenticateUser(user, device);
      return right(result);
    }

    return left(new WrongCredentialsError());
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

    await this.refreshTokenRepository.save(refreshTokenEntity);

    user.sign();
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
