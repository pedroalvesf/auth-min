import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DeviceNotFoundError } from '@/domain/auth/application/use-cases/errors/device-not-found-error';
import { UserNotFoundError } from '@/domain/auth/application/use-cases/errors/user-not-found-error';
import { RevokeAllDevicesUseCase } from '@/domain/auth/application/use-cases/revoke-all-devices';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';

@Controller('/logout/:userId')
@UseGuards(JwtAuthGuard)
export class RevokeAllDevicesController {
  constructor(private readonly revokeAllDevices: RevokeAllDevicesUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Revoke all devices for a user' })
  @ApiResponse({ status: 200, description: 'All devices revoked successfully' })
  @ApiResponse({ status: 400, description: 'Device session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
