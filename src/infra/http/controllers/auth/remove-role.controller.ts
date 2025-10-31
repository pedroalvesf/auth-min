import {
  Controller,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  NotFoundException,
  Req,
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
import { RemoveRoleFromUserUseCase } from "@/domain/auth/application/use-cases/remove-role-from-user";
import { RemoveRoleDto } from "../dto/remove-role-dto";
import { Request } from "express";

interface RequestWithUser extends Request {
  user?: {
    sub: string;
    email?: string;
  };
}

@ApiTags("Roles")
@Controller("roles")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RemoveRoleController {
  constructor(private removeRole: RemoveRoleFromUserUseCase) {}

  @Delete("remove")
  @HttpCode(200)
  @RequirePermission("roles", "assign") // Usando a mesma permissão do assign (admin pode atribuir e remover)
  @ApiOperation({
    summary: "Remove role from user",
    description:
      "Removes a role from a user. Requires 'roles:assign' permission (admin level access).",
  })
  @ApiResponse({
    status: 200,
    description: "Role removed successfully",
    schema: {
      example: {
        success: true,
        message: "Role removed from user successfully",
        userId: "550e8400-e29b-41d4-a716-446655440000",
        roleId: "650e8400-e29b-41d4-a716-446655440001",
        removedBy: "750e8400-e29b-41d4-a716-446655440002",
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Insufficient permissions",
  })
  @ApiResponse({
    status: 404,
    description: "User or role not found",
  })
  async handle(@Body() body: RemoveRoleDto, @Req() request: RequestWithUser) {
    const { userId, roleId } = body;
    const removedBy = request.user?.sub;

    const result = await this.removeRole.execute({
      userId,
      roleId,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new NotFoundException(error.message);
    }

    return {
      success: true,
      message: result.value.message,
      userId,
      roleId,
      removedBy,
    };
  }
}