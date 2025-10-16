import { Injectable } from '@nestjs/common';
import { Either, left, right } from "../../../../core/either";
import { TokenValidator } from "../cryptography/token-validator";
import { UsersRepository } from "@/domain/auth/repositories/users-repository";
import { AccessTokenRepository } from "@/domain/auth/repositories/access-token-repository";
import { UniqueEntityID } from "../../../../core/entities/unique-entity-id";
import { InvalidTokenError } from "./errors/invalid-token-error";

export interface ValidateTokenResult {
  userId: string;
  email: string;
  name?: string;
}

@Injectable()
export class ValidateTokenUseCase {
  constructor(
    private userRepository: UsersRepository,
    private accessTokenRepository: AccessTokenRepository,
    private tokenValidator: TokenValidator
  ) {}

  async execute(
    token: string
  ): Promise<Either<InvalidTokenError, ValidateTokenResult>> {
    const payload = await this.tokenValidator.validate(token);

    if (!payload || payload.type === "refresh") {
      return left(new InvalidTokenError());
    }

    const storedAccessToken = await this.accessTokenRepository.findByToken(
      token
    );

    if (!storedAccessToken || storedAccessToken.isExpired()) {
      return left(new InvalidTokenError());
    }

    const user = await this.userRepository.findById(
      new UniqueEntityID(payload.sub)
    );

    if (!user) {
      return left(new InvalidTokenError());
    }

    return right({
      userId: user.id.toString(),
      email: user.email,
      name: user.name,
    });
  }
}
