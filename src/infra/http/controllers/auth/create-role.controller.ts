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
import { CreateRoleUseCase } from '@/domain/auth/application/use-cases/create-role';
import { CreateRoleDto } from '../dto/create-role-dto';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CreateRoleController {
  constructor(private createRole: CreateRoleUseCase) {}

  @Post()
  @HttpCode(201)
  @RequirePermission('roles', 'create')
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
