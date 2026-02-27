import { Controller, Get, UseGuards, HttpCode, Query } from '@nestjs/common';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { RequirePermission } from '@/infra/auth/decorators/require-permission.decorator';
import { PermissionsGuard } from '@/infra/auth/guards/permissions-guard';
import { ListPermissionsUseCase } from '@/domain/auth/application/use-cases/list-permissions';
import { PermissionPresenter } from '../../presenters/permission-presenter';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListPermissionsController {
  constructor(private listPermissions: ListPermissionsUseCase) {}

  @Get()
  @HttpCode(200)
  @RequirePermission('permissions', 'read')
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
