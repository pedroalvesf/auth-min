import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  @MinLength(2)
  resource!: string;

  @IsString()
  @MinLength(1)
  action!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
