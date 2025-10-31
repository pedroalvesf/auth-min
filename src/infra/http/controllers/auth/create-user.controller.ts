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
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller("auth/user")
export class CreateUserController {
  constructor(
    private createUser: CreateUserUseCase,
    private authenticateDevice: AuthenticateDeviceUseCase
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "Create new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 409, description: "User already exists" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiResponse({ status: 503, description: "Service unavailable" })
  @ApiResponse({ status: 504, description: "Gateway timeout" })
  @ApiResponse({ status: 505, description: "HTTP version not supported" })
  @ApiResponse({ status: 506, description: "Variant also negotiates" })
  @ApiResponse({ status: 507, description: "Insufficient storage" })
  @ApiResponse({ status: 508, description: "Loop detected" })
  @ApiResponse({ status: 509, description: "Bandwidth limit exceeded" })
  @ApiResponse({ status: 510, description: "Not extended" })
  @ApiResponse({ status: 511, description: "Network authentication required" })
  async handle(
    @Body() body: CreateUserDto,
    @Headers() headers: Record<string, string>
  ) {
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

    const geo = await geoip.lookup(headers["x-ipaddress"]);
    const location = geo ? `${geo.city}, ${geo.country}` : "unknown";

    const deviceEntity = Device.create({
      userId: new UniqueEntityID(result.value.user.id.toString()),
      name: `${headers["x-operatingsystem"]} - ${headers["x-browser"]}`,
      type: headers["x-type"],
      operatingSystem: headers["x-operatingsystem"],
      ipAddress: headers["x-ipaddress"],
      browser: headers["x-browser"],
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
