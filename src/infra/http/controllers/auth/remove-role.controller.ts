import {
  Controller,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { RequirePermission } from '@/infra/auth/decorators/require-permission.decorator';
import { PermissionsGuard } from '@/infra/auth/guards/permissions-guard';
import { RemoveRoleFromUserUseCase } from '@/domain/auth/application/use-cases/remove-role-from-user';
import { RemoveRoleDto } from '../dto/remove-role-dto';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    sub: string;
    email?: string;
  };
}

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RemoveRoleController {
  constructor(private removeRole: RemoveRoleFromUserUseCase) {}

  @Delete('remove')
  @HttpCode(200)
  @RequirePermission('roles', 'assign')
  async handle(@Body() body: RemoveRoleDto, @Req() request: RequestWithUser) {
    const { userId, roleId } = body;
    const removedBy = request.user?.sub;

    const result = await this.removeRole.execute({
      userId,
      roleId,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new NotFoundException(error.message);
    }

    return {
      success: true,
      message: result.value.message,
      userId,
      roleId,
      removedBy,
    };
  }
}
