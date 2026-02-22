import { Controller, Get, UseGuards, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { RequirePermission } from '@/infra/auth/decorators/require-permission.decorator';
import { PermissionsGuard } from '@/infra/auth/guards/permissions-guard';
import { ListRolesUseCase } from '@/domain/auth/application/use-cases/list-roles';
import { RolePresenter } from '../../presenters/role-presenter';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ListRolesController {
  constructor(private listRoles: ListRolesUseCase) {}

  @Get()
  @HttpCode(200)
  @RequirePermission('roles', 'read')
  @ApiOperation({
    summary: 'List all roles',
    description:
      "Returns a list of all roles in the system. Requires 'roles:read' permission. Roles are ordered by level (ascending).",
  })
  @ApiResponse({
    status: 200,
    description: 'List of roles',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Super Admin',
          slug: 'super-admin',
          description: 'Full system access',
          level: 0,
          assignableRoles: ['admin', 'manager', 'editor', 'viewer'],
          createdAt: '2025-10-29T12:00:00Z',
          updatedAt: '2025-10-29T12:00:00Z',
        },
        {
          id: '650e8400-e29b-41d4-a716-446655440001',
          name: 'Admin',
          slug: 'admin',
          description: 'Administrator with elevated permissions',
          level: 1,
          assignableRoles: ['manager', 'editor', 'viewer'],
          createdAt: '2025-10-29T12:00:00Z',
          updatedAt: '2025-10-29T12:00:00Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async handle() {
    const result = await this.listRoles.execute();

    if (result.isLeft()) {
      throw new Error('Failed to list roles');
    }

    const { roles } = result.value;

    return {
      roles: RolePresenter.toHTTPList(roles),
      total: roles.length,
    };
  }
}
