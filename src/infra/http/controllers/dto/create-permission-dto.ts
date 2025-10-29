import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, MinLength } from "class-validator";

export class CreatePermissionDto {
  @ApiProperty({
    example: "Create Post",
    description: "Nome legível da permissão",
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: "posts",
    description: "Recurso da permissão (ex: users, posts, devices)",
  })
  @IsString()
  @MinLength(2)
  resource: string;

  @ApiProperty({
    example: "create",
    description: "Ação da permissão (ex: create, read, update, delete, *)",
  })
  @IsString()
  @MinLength(1)
  action: string;

  @ApiProperty({
    example: "Permite criar novos posts no sistema",
    description: "Descrição detalhada da permissão",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

