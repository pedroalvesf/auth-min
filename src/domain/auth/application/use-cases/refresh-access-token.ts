import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { UsersRepository } from '@/domain/auth/application/repositories/users-repository';
import { RefreshTokenRepository } from '@/domain/auth/application/repositories/refresh-token-repository';
import { RefreshToken } from '@/domain/auth/enterprise/entities/refresh-token';
import { Encrypter } from '../cryptography/encrypter';
import { UserNotFoundError } from './errors/user-not-found-error';
import { RefreshTokenExpiredError } from './errors/refresh-token-expired-error';
import { RefreshTokenNotFoundError } from './errors/refresh-token-not-found-error';
import { RefreshTokenReuseError } from './errors/refresh-token-reuse-error';
import { REFRESH_TOKEN_TTL_MS } from './token-config';

interface RefreshAccessTokenUseCaseRequest {
  refreshToken: string;
}

type RefreshAccessTokenUseCaseResponse = Either<
  | UserNotFoundError
  | RefreshTokenExpiredError
  | RefreshTokenNotFoundError
  | RefreshTokenReuseError,
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
    const currentToken = await this.refreshTokenRepository.findByToken(
      refreshToken
    );

    if (!currentToken) {
      return left(new RefreshTokenNotFoundError());
    }

    // Detecção de reuso: um token já revogado sendo apresentado indica
    // roubo/replay. Revoga a família inteira e força novo login.
    if (currentToken.isRevoked()) {
      await this.revokeFamily(currentToken.familyId.toString());
      return left(new RefreshTokenReuseError());
    }

    if (currentToken.isExpired()) {
      return left(new RefreshTokenExpiredError());
    }

    const user = await this.userRepository.findById(
      currentToken.userId.toString()
    );

    if (!user) {
      return left(new UserNotFoundError(currentToken.userId.toString()));
    }

    // Rotação: revoga o token atual e emite um novo na mesma família.
    currentToken.revoke();
    await this.refreshTokenRepository.save(currentToken);

    const { accessToken, refreshToken: newRefreshToken } =
      await this.encrypter.encrypt({
        sub: currentToken.userId.toString(),
        deviceId: currentToken.deviceId.toString(),
      });

    const rotatedToken = RefreshToken.create({
      userId: currentToken.userId,
      deviceId: currentToken.deviceId,
      familyId: currentToken.familyId,
      token: newRefreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    await this.refreshTokenRepository.create(rotatedToken);

    return right({
      accessToken,
      refreshToken: rotatedToken.token,
    });
  }

  private async revokeFamily(familyId: string): Promise<void> {
    const familyTokens = await this.refreshTokenRepository.findByFamilyId(
      familyId
    );

    for (const token of familyTokens) {
      if (token.isRevoked()) continue;
      token.revoke();
      await this.refreshTokenRepository.save(token);
    }
  }
}
