import { Either, left, right } from "../../../../core/either";
import { User } from "../../../auth/enterprise/entities/user";
import { UserRepository } from "../../../repositories/user-repository";
import { PasswordService } from "../../../../infra/security/password";
import { RegisterUserDto } from "../../../../infra/http/dtos/register-user-dto";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";

export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    dto: RegisterUserDto
  ): Promise<Either<UserAlreadyExistsError, User>> {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      return left(new UserAlreadyExistsError());
    }

    const hashedPassword = await PasswordService.hash(dto.password);

    const user = User.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    await this.userRepository.save(user);

    return right(user);
  }
}
