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

@Controller('/login')
@Public()
export class AuthenticateDeviceController {
  constructor(
    private authenticateDeviceUseCase: AuthenticateDeviceUseCase,
    private usersRepository: UsersRepository
  ) {}

  @Post()
  @HttpCode(201)
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

    const device = Device.create({
      userId: new UniqueEntityID(user.id.toString()),
      name: `${operatingSystem} - ${browser}`,
      type: deviceType,
      operatingSystem,
      ipAddress,
      browser,
      location: 'unknown',
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
