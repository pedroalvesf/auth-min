import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Headers,
  HttpCode,
  Post,
} from "@nestjs/common";
import { CreateUserUseCase } from "@/domain/auth/application/use-cases/create-user";
// import { UserAlreadyExistsError } from '@/domain/auth/application/use-cases/errors/user-already-exists-error'
import { CreateUserDto } from "../dto/create-user-dto";
import { ListUserPresenter } from "../../presenters/list-user-presenter";
import { UserAlreadyExistsError } from "@/domain/auth/application/use-cases/errors/user-already-exists-error";
import { AuthenticateDeviceUseCase } from "@/domain/auth/application/use-cases/authenticate-device";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import geoip from "geoip-lite";
import { Device } from "@/domain/auth/enterprise/entities/device";

@Controller("auth/user")
export class CreateUserController {
  constructor(
    private createUser: CreateUserUseCase,
    private authenticateDevice: AuthenticateDeviceUseCase
  ) {}

  @Post()
  @HttpCode(201)
  async handle(@Body() body: CreateUserDto, @Headers() headers: Headers) {
    const { email, password, name } = body;
    const result = await this.createUser.execute({
      email,
      password,
      name,
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

    const geo = await geoip.lookup(headers.get("x-ipaddress") ?? "");
    const location = geo ? `${geo.city}, ${geo.country}` : "unknown";

    const deviceEntity = Device.create({
      userId: new UniqueEntityID(result.value.user.id.toString()),
      name: `${headers.get("x-operatingsystem") ?? "Unknown"} - ${
        headers.get("x-browser") ?? "Unknown"
      }`,
      type: headers.get("x-type") ?? "Unknown",
      operatingSystem: headers.get("x-operatingsystem") ?? "Unknown",
      ipAddress: headers.get("x-ipaddress") ?? "Unknown",
      browser: headers.get("x-browser") ?? "Unknown",
      location: location,
      lastLogin: new Date(),
      createdAt: new Date(),
      active: true,
    });

    const tokens = await this.authenticateDevice.execute({
      password,
      device: deviceEntity,
    });

    if (tokens.isLeft()) {
      throw new BadRequestException(tokens.value.message);
    }

    return {
      accessToken: tokens.value.accessToken.token,
      refreshToken: tokens.value.refreshToken.token,
    };
  }
}
