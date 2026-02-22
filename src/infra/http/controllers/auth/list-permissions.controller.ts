import { Controller, Get, UseGuards, HttpCode, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { RequirePermission } from '@/infra/auth/decorators/require-permission.decorator';
import { PermissionsGuard } from '@/infra/auth/guards/permissions-guard';
import { ListPermissionsUseCase } from '@/domain/auth/application/use-cases/list-permissions';
import { PermissionPresenter } from '../../presenters/permission-presenter';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ListPermissionsController {
  constructor(private listPermissions: ListPermissionsUseCase) {}

  @Get()
  @HttpCode(200)
  @RequirePermission('permissions', 'read')
  @ApiOperation({
    summary: 'List all permissions',
    description:
      "Returns a list of all permissions in the system. Requires 'permissions:read' permission. Permissions are grouped by resource and ordered by action.",
  })
  @ApiQuery({
    name: 'resource',
    required: false,
    description: 'Filter by resource (e.g., users, roles, devices)',
    example: 'users',
  })
  @ApiResponse({
    status: 200,
    description: 'List of permissions',
    schema: {
      example: {
        permissions: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Create User',
            slug: 'users:create',
            description: 'Can create new users',
            resource: 'users',
            action: 'create',
            createdAt: '2025-10-29T12:00:00Z',
            updatedAt: '2025-10-29T12:00:00Z',
          },
          {
            id: '650e8400-e29b-41d4-a716-446655440001',
            name: 'Read User',
            slug: 'users:read',
            description: 'Can view user details',
            resource: 'users',
            action: 'read',
            createdAt: '2025-10-29T12:00:00Z',
            updatedAt: '2025-10-29T12:00:00Z',
          },
        ],
        total: 2,
        groupedByResource: {
          users: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async handle(@Query('resource') resource?: string) {
    const result = await this.listPermissions.execute();

    const { permissions } = result.value;

    let filteredPermissions = permissions;
    if (resource) {
      filteredPermissions = permissions.filter(
        (p) => p.resource.toLowerCase() === resource.toLowerCase()
      );
    }

    const groupedByResource = filteredPermissions.reduce((acc, permission) => {
      const res = permission.resource;
      acc[res] = (acc[res] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      permissions: PermissionPresenter.toHTTPList(filteredPermissions),
      total: filteredPermissions.length,
      groupedByResource,
    };
  }
}
