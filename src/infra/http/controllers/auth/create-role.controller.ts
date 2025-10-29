import { Controller, Post, Body, UseGuards, HttpCode } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { RequirePermission } from "@/infra/auth/decorators/require-permission.decorator";
import { PermissionsGuard } from "@/infra/auth/guards/permissions-guard";
import { CreateRoleUseCase } from "@/domain/auth/application/use-cases/create-role";
import { CreateRoleDto } from "../dto/create-role-dto";

@ApiTags("Roles")
@Controller("roles")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CreateRoleController {
  constructor(private createRole: CreateRoleUseCase) {}

  @Post()
  @HttpCode(201)
  @RequirePermission("roles", "create")
  @ApiOperation({ summary: "Create new role" })
  @ApiResponse({ status: 201, description: "Role created successfully" })
  @ApiResponse({ status: 400, description: "Role already exists" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async handle(@Body() body: CreateRoleDto) {
    const result = await this.createRole.execute(body);

    if (result.isLeft()) {
      const error = result.value;
      throw new Error(error.message);
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
