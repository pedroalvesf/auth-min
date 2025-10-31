import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from "@nestjs/common";
import { DeleteUserUseCase } from "@/domain/auth/application/use-cases/delete-user";
import { UserNotFoundError } from "@/domain/auth/application/use-cases/errors/user-not-found-error";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller("auth/user")
export class DeleteUserController {
  constructor(private deleteUser: DeleteUserUseCase) {}

  @Delete(":id")
  @HttpCode(200)
  @ApiOperation({ summary: "Delete user by ID" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async handle(@Param("id") userId: string) {
    const result = await this.deleteUser.execute({
      userId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return {
      message: result.value.message,
    };
  }
}