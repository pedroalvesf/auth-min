import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DeleteUserUseCase } from '@/domain/auth/application/use-cases/delete-user';
import { UserNotFoundError } from '@/domain/auth/application/use-cases/errors/user-not-found-error';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { PermissionsGuard } from '@/infra/auth/guards/permissions-guard';
import { RequirePermission } from '@/infra/auth/decorators/require-permission.decorator';

@Controller('auth/user')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DeleteUserController {
  constructor(private deleteUser: DeleteUserUseCase) {}

  @Delete(':id')
  @HttpCode(200)
  @RequirePermission('users', 'delete')
  async handle(@Param('id') userId: string) {
    const result = await this.deleteUser.execute({
      userId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return {
      message: result.value.message,
    };
  }
}
