import { Controller, Get, UseGuards, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { RequirePermission } from '@/infra/auth/decorators/require-permission.decorator';
import { PermissionsGuard } from '@/infra/auth/guards/permissions-guard';
import { ListRolesUseCase } from '@/domain/auth/application/use-cases/list-roles';
import { RolePresenter } from '../../presenters/role-presenter';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ListRolesController {
  constructor(private listRoles: ListRolesUseCase) {}

  @Get()
  @HttpCode(200)
  @RequirePermission('roles', 'read')
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
