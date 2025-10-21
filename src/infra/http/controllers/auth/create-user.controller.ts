import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from "@nestjs/common";
import { CreateUserUseCase } from "@/domain/auth/application/use-cases/create-user";
// import { UserAlreadyExistsError } from '@/domain/auth/application/use-cases/errors/user-already-exists-error'
import { CreateUserDto } from "../dto/create-user-dto";
import { ListUserPresenter } from "../../presenters/list-user-presenter";
import { UserAlreadyExistsError } from "@/domain/auth/application/use-cases/errors/user-already-exists-error";

@Controller("auth/user")
export class CreateUserController {
  constructor(private createUser: CreateUserUseCase) {}

  @Post("create-user")
  @HttpCode(201)
  async handle(@Body() body: CreateUserDto): Promise<User> {
    const { email, password, firstName, lastName } = body;
    const result = await this.createUser.execute({
      email,
      password,
      name: `${firstName} ${lastName}`,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserAlreadyExistsError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return ListUserPresenter.toHTTP(result.value.user);
  }
}
