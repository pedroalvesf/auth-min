import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { AuthenticateDeviceUseCase } from '@/domain/auth/application/use-cases/authenticate-device';
import { WrongCredentialsError } from '@/domain/auth/application/use-cases/errors/wrong-credentials-error';
import {
  Controller,
  Post,
  HttpCode,
  Body,
  HttpException,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { AuthenticateDeviceDto } from '../dto/authenticate-device-dto';
import { Device } from '@/domain/auth/enterprise/entities/device';
import { Public } from '@/infra/auth/public';
import { UsersRepository } from '@/domain/auth/application/repositories/users-repository';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiHeader,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthResponseDto, ErrorResponseDto } from '../dto/auth-response-dto';

@ApiTags('Authentication')
@Controller('/login')
@Public()
export class AuthenticateDeviceController {
  constructor(
    private authenticateDeviceUseCase: AuthenticateDeviceUseCase,
    private usersRepository: UsersRepository
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Authenticate user device',
    description:
      'Authenticates a user with email and password, creating or updating device information and returning access and refresh tokens.',
  })
  @ApiBody({ type: AuthenticateDeviceDto })
  @ApiHeader({
    name: 'x-ipaddress',
    description: 'Client IP address for device tracking',
    required: true,
    example: '192.168.1.1',
  })
  @ApiHeader({
    name: 'x-operatingsystem',
    description: 'Operating system information',
    required: true,
    example: 'macOS Ventura',
  })
  @ApiHeader({
    name: 'x-browser',
    description: 'Browser information',
    required: true,
    example: 'Safari 16.0',
  })
  @ApiHeader({
    name: 'x-type',
    description: 'Device type',
    required: true,
    example: 'desktop',
    schema: { enum: ['desktop', 'mobile', 'tablet'] },
  })
  @ApiCreatedResponse({
    description: 'User authenticated successfully',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or missing required headers',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: ErrorResponseDto,
  })
  async handle(
    @Body() body: AuthenticateDeviceDto,
    @Headers() headers: Record<string, string>
  ) {
    const user = await this.usersRepository.findByEmail(body.email);

    if (!user) {
      throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
    }

    const ipAddress = headers['x-ipaddress'] ?? '';
    const operatingSystem = headers['x-operatingsystem'] ?? 'Unknown';
    const browser = headers['x-browser'] ?? 'Unknown';
    const deviceType = headers['x-type'] ?? 'Unknown';

    if (!ipAddress || !operatingSystem || !browser || !deviceType) {
      throw new HttpException(
        'Required headers missing: x-ipaddress, x-operatingsystem, x-browser, x-type',
        HttpStatus.BAD_REQUEST
      );
    }

    const location = 'unknown';

    const device = Device.create({
      userId: new UniqueEntityID(user.id.toString()),
      name: `${operatingSystem} - ${browser}`,
      type: deviceType,
      operatingSystem,
      ipAddress,
      browser,
      location,
      lastLogin: new Date(),
      createdAt: new Date(),
      active: true,
    });

    const result = await this.authenticateDeviceUseCase.execute({
      password: body.password,
      device,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new HttpException(
            'Credenciais inválidas',
            HttpStatus.UNAUTHORIZED
          );
        default:
          throw new HttpException(
            'Erro interno do servidor',
            HttpStatus.INTERNAL_SERVER_ERROR
          );
      }
    }

    const { accessToken, refreshToken } = result.value;

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    };
  }
}
