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
import { CreateUserDto } from "../dto/create-user-dto";
import { ListUserPresenter } from "../../presenters/list-user-presenter";
import { UserAlreadyExistsError } from "@/domain/auth/application/use-cases/errors/user-already-exists-error";
import { AuthenticateDeviceUseCase } from "@/domain/auth/application/use-cases/authenticate-device";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import geoip from "geoip-lite";
import { Device } from "@/domain/auth/enterprise/entities/device";
import { 
  ApiOperation, 
  ApiResponse, 
  ApiTags, 
  ApiHeader,
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse 
} from "@nestjs/swagger";
import { AuthResponseDto, ErrorResponseDto } from "../dto/auth-response-dto";

@ApiTags('Authentication')
@Controller("auth/user")
export class CreateUserController {
  constructor(
    private createUser: CreateUserUseCase,
    private authenticateDevice: AuthenticateDeviceUseCase
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ 
    summary: "Create new user", 
    description: "Creates a new user account and automatically authenticates the device, returning access and refresh tokens."
  })
  @ApiBody({ type: CreateUserDto })
  @ApiHeader({
    name: 'x-ipaddress',
    description: 'Client IP address for device tracking',
    required: true,
    example: '192.168.1.1'
  })
  @ApiHeader({
    name: 'x-operatingsystem',
    description: 'Operating system information',
    required: true,
    example: 'Windows 10'
  })
  @ApiHeader({
    name: 'x-browser',
    description: 'Browser information',
    required: true,
    example: 'Chrome 120.0'
  })
  @ApiHeader({
    name: 'x-type',
    description: 'Device type',
    required: true,
    example: 'desktop',
    schema: { enum: ['desktop', 'mobile', 'tablet'] }
  })
  @ApiCreatedResponse({ 
    description: "User created successfully and device authenticated", 
    type: AuthResponseDto
  })
  @ApiBadRequestResponse({ 
    description: "Invalid input data or missing required headers", 
    type: ErrorResponseDto
  })
  @ApiConflictResponse({ 
    description: "User already exists", 
    type: ErrorResponseDto
  })
  async handle(
    @Body() body: CreateUserDto,
    @Headers() headers: Record<string, string>
  ) {
    // Validate required device headers
    const ipAddress = headers["x-ipaddress"];
    const operatingSystem = headers["x-operatingsystem"];
    const browser = headers["x-browser"];
    const deviceType = headers["x-type"];

    if (!ipAddress || !operatingSystem || !browser || !deviceType) {
      throw new BadRequestException(
        "Headers obrigatórios ausentes: x-ipaddress, x-operatingsystem, x-browser, x-type"
      );
    }

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

    const geo = geoip.lookup(ipAddress);
    const location = geo ? `${geo.city}, ${geo.country}` : "unknown";

    const deviceEntity = Device.create({
      userId: new UniqueEntityID(result.value.user.id.toString()),
      name: `${operatingSystem} - ${browser}`,
      type: deviceType,
      operatingSystem,
      ipAddress,
      browser,
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
