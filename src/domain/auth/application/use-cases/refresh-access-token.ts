import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/auth/application/repositories/users-repository';
import { RefreshTokenRepository } from '@/domain/auth/application/repositories/refresh-token-repository';
import { AccessToken } from '@/domain/auth/enterprise/entities/access-token';
import { Encrypter } from '../cryptography/encrypter';
import { InvalidTokenError } from '@/domain/auth/application/use-cases/errors/invalid-token-error';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { RefreshTokenExpiredError } from './errors/refresh-token-expired-error';
import { UserNotFoundError } from './errors/user-not-found-error';
import { RefreshTokenNotFoundError } from './errors/refresh-token-not-found-error';

interface RefreshAccessTokenUseCaseRequest {
  refreshToken: string;
}

type RefreshAccessTokenUseCaseResponse = Either<
  | InvalidTokenError
  | UserNotFoundError
  | RefreshTokenExpiredError
  | RefreshTokenNotFoundError,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    private userRepository: UsersRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private encrypter: Encrypter
  ) {}

  async execute({
    refreshToken,
  }: RefreshAccessTokenUseCaseRequest): Promise<RefreshAccessTokenUseCaseResponse> {
    const refreshTokenEntity = await this.refreshTokenRepository.findByToken(
      refreshToken
    );

    if (!refreshTokenEntity) {
      return left(new RefreshTokenNotFoundError());
    }

    if (!refreshTokenEntity.isValid()) {
      return left(new RefreshTokenExpiredError());
    }

    const user = await this.userRepository.findById(
      refreshTokenEntity.userId.toString()
    );

    if (!user) {
      return left(new UserNotFoundError(refreshTokenEntity.userId.toString()));
    }

    const { accessToken } = await this.encrypter.encrypt({
      sub: refreshTokenEntity.userId.toString(),
      deviceId: refreshTokenEntity.deviceId.toString(),
    });

    const newAccessTokenEntity = AccessToken.create({
      userId: new UniqueEntityID(user.id.toString()),
      token: accessToken,
      expiresAt: new Date(Date.now() + 900 * 1000),
      createdAt: new Date(),
      revoked: false,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return right({
      accessToken: newAccessTokenEntity.token,
      refreshToken: refreshTokenEntity.token,
    });
  }
}
