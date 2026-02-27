import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  ConflictException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { RequirePermission } from '@/infra/auth/decorators/require-permission.decorator';
import { PermissionsGuard } from '@/infra/auth/guards/permissions-guard';
import { CreatePermissionUseCase } from '@/domain/auth/application/use-cases/create-permission';
import { CreatePermissionDto } from '../dto/create-permission-dto';
import { PermissionPresenter } from '../../presenters/permission-presenter';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CreatePermissionController {
  constructor(private createPermission: CreatePermissionUseCase) {}

  @Post()
  @HttpCode(201)
  @RequirePermission('permissions', 'create')
  async handle(@Body() body: CreatePermissionDto) {
    const { name, resource, action, description } = body;

    const result = await this.createPermission.execute({
      name,
      resource,
      action,
      description,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new ConflictException(error.message);
    }

    const { permission } = result.value;

    return PermissionPresenter.toHTTP(permission);
  }
}
