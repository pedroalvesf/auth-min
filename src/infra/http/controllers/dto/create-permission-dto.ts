import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'Create Post',
    description: 'Human-readable permission name',
  })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({
    example: 'posts',
    description: 'Permission resource (e.g., users, posts, devices)',
  })
  @IsString()
  @MinLength(2)
  resource!: string;

  @ApiProperty({
    example: 'create',
    description: 'Permission action (e.g., create, read, update, delete, *)',
  })
  @IsString()
  @MinLength(1)
  action!: string;

  @ApiProperty({
    example: 'Permite criar novos posts no sistema',
    description: 'Detailed permission description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
