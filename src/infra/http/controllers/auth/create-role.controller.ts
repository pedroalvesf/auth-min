import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  ConflictException,
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
import { CreateRoleUseCase } from '@/domain/auth/application/use-cases/create-role';
import { CreateRoleDto } from '../dto/create-role-dto';
import { RoleResponseDto } from '../dto/role-response-dto';

@ApiTags('Authorization')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class CreateRoleController {
  constructor(private createRole: CreateRoleUseCase) {}

  @Post()
  @HttpCode(201)
  @RequirePermission('roles', 'create')
  @ApiOperation({
    summary: 'Create new role',
    description:
      "Creates a new role in the system. Requires 'roles.create' permission.",
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Role already exists or invalid data',
    schema: {
      example: {
        statusCode: 400,
        message: 'Role already exists',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden',
        error: "You need 'roles.create' permission",
      },
    },
  })
  async handle(@Body() body: CreateRoleDto) {
    const result = await this.createRole.execute(body);

    if (result.isLeft()) {
      const error = result.value;
      throw new ConflictException(error.message);
    }

    const { role } = result.value;

    return {
      id: role.id.toString(),
      name: role.name,
      slug: role.slug,
      level: role.level,
    };
  }
}
