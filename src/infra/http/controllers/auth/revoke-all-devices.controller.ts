import {
  BadRequestException,
  Controller,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DeviceNotFoundError } from '@/domain/auth/application/use-cases/errors/device-not-found-error';
import { UserNotFoundError } from '@/domain/auth/application/use-cases/errors/user-not-found-error';
import { RevokeAllDevicesUseCase } from '@/domain/auth/application/use-cases/revoke-all-devices';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';

@Controller('/logout/:userId')
@UseGuards(JwtAuthGuard)
export class RevokeAllDevicesController {
  constructor(private readonly revokeAllDevices: RevokeAllDevicesUseCase) {}

  @Post()
  async handle(@Param('userId') userId: string) {
    const result = await this.revokeAllDevices.execute({
      userId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case DeviceNotFoundError:
          throw new BadRequestException('Device session not found');
        case UserNotFoundError:
          throw new BadRequestException('User not found');
      }
    }

    return {
      success: true,
      message: 'All devices revoked successfully',
    };
  }
}
