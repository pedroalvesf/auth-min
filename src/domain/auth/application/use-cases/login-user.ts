import { Either, left, right } from "../../../../core/either";
import { UserRepository } from "../../../repositories/user-repository";
import { SessionRepository } from "../../../repositories/session-repository";
import { Session } from "../../../auth/enterprise/entities/session";
import { PasswordService } from "../../../../infra/security/password";
import { JwtService } from "../../../../infra/security/jwt";
import { LoginUserDto } from "../../../../infra/http/dtos/login-user-dto";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export class LoginUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private jwtSecret: string
  ) {}

  async execute(
    dto: LoginUserDto
  ): Promise<Either<InvalidCredentialsError, LoginResult>> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      return left(new InvalidCredentialsError());
    }

    const isPasswordValid = await PasswordService.verify(
      dto.password,
      user.password
    );

    if (!isPasswordValid) {
      return left(new InvalidCredentialsError());
    }

    const accessToken = JwtService.sign(
      { sub: user.id.toString(), email: user.email },
      this.jwtSecret,
      900 // 15 minutes
    );

    const refreshToken = JwtService.sign(
      { sub: user.id.toString(), type: "refresh" },
      this.jwtSecret,
      604800 // 7 days
    );

    const session = Session.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 604800 * 1000),
    });

    await this.sessionRepository.save(session);

    return right({
      accessToken,
      refreshToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  }
}
