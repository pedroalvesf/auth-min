import {
  Controller,
  Delete,
  HttpCode,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { RevokeDeviceSessionUseCase } from '@/domain/auth/application/use-cases/revoke-device-session';
import { RevokeDeviceSessionDto } from '../dto/revoke-device-dto';
import { RefreshTokenNotFoundError } from '@/domain/auth/application/use-cases/errors/refresh-token-not-found-error';
import { DeviceNotFoundError } from '@/domain/auth/application/use-cases/errors/device-not-found-error';

@Controller('/revoke-device-session')
@UseGuards(JwtAuthGuard)
export class RevokeDeviceSessionController {
  constructor(private revokeDeviceSessionUseCase: RevokeDeviceSessionUseCase) {}

  @Delete()
  @HttpCode(200)
  async handle(
    @Body() body: RevokeDeviceSessionDto,
    @Request() request: { user: { sub: string } }
  ) {
    const userId = request.user.sub;

    const result = await this.revokeDeviceSessionUseCase.execute({
      deviceId: body.deviceId,
      userId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case RefreshTokenNotFoundError:
          throw new HttpException(
            'No refresh tokens found for this device',
            HttpStatus.NOT_FOUND
          );
        case DeviceNotFoundError:
          throw new HttpException(
            'Device not found or does not belong to the user',
            HttpStatus.NOT_FOUND
          );
        default:
          throw new HttpException(
            'Erro interno do servidor',
            HttpStatus.INTERNAL_SERVER_ERROR
          );
      }
    }

    return {
      message: 'Device session revoked successfully',
      success: result.value.success,
    };
  }
}
