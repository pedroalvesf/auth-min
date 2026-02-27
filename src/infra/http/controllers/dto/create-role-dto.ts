import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  level!: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignableRoles?: string[];
}
