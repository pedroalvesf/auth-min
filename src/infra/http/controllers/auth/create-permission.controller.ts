import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { RequirePermission } from "@/infra/auth/decorators/require-permission.decorator";
import { PermissionsGuard } from "@/infra/auth/guards/permissions-guard";
import { CreatePermissionUseCase } from "@/domain/auth/application/use-cases/create-permission";
import { CreatePermissionDto } from "../dto/create-permission-dto";
import { PermissionPresenter } from "../../presenters/permission-presenter";

@ApiTags("Permissions")
@Controller("permissions")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CreatePermissionController {
  constructor(private createPermission: CreatePermissionUseCase) {}

  @Post()
  @HttpCode(201)
  @RequirePermission("permissions", "create")
  @ApiOperation({
    summary: "Create new permission",
    description:
      "Creates a new permission in the system. Requires 'permissions:create' permission. The slug is automatically generated as 'resource:action'.",
  })
  @ApiResponse({
    status: 201,
    description: "Permission created successfully",
    schema: {
      example: {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Create Post",
        slug: "posts:create",
        description: "Permite criar novos posts",
        resource: "posts",
        action: "create",
        createdAt: "2025-10-29T12:00:00Z",
        updatedAt: "2025-10-29T12:00:00Z",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input data",
  })
  @ApiResponse({
    status: 403,
    description: "Insufficient permissions",
  })
  @ApiResponse({
    status: 409,
    description: "Permission already exists",
  })
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
