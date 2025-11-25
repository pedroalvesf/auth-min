import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  NotFoundException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AssignRoleController {
  constructor(private assignRole: AssignRoleToUserUseCase) {}

  @Post('assign')
  @HttpCode(200)
  @RequirePermission('roles', 'assign')
  @ApiOperation({
    summary: 'Assign role to user',
    description:
      "Assigns a role to a user. Requires 'roles:assign' permission. The assignment is tracked with the ID of the user performing the action.",
  })
  @ApiResponse({
    status: 200,
    description: 'Role assigned successfully',
    schema: {
      example: {
        success: true,
        message: 'Role assigned successfully',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        roleId: '650e8400-e29b-41d4-a716-446655440001',
        assignedBy: '750e8400-e29b-41d4-a716-446655440002',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'User or role not found',
  })
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
