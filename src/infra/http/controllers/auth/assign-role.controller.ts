import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { RequirePermission } from '@/infra/auth/decorators/require-permission.decorator';
import { PermissionsGuard } from '@/infra/auth/guards/permissions-guard';
import { AssignRoleToUserUseCase } from '@/domain/auth/application/use-cases/assign-role-to-user';
import { AssignRoleDto } from '../dto/assign-role-dto';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    sub: string;
    email?: string;
  };
}

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AssignRoleController {
  constructor(private assignRole: AssignRoleToUserUseCase) {}

  @Post('assign')
  @HttpCode(200)
  @RequirePermission('roles', 'assign')
  async handle(@Body() body: AssignRoleDto, @Req() request: RequestWithUser) {
    const { userId, roleId } = body;
    const assignedBy = request.user?.sub;

    const result = await this.assignRole.execute({
      userId,
      roleId,
      assignedBy,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new NotFoundException(error.message);
    }

    return {
      success: true,
      message: 'Role assigned successfully',
      userId,
      roleId,
      assignedBy,
    };
  }
}
