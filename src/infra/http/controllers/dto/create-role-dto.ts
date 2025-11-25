import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Administrator' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Full system access', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 0,
    description: '0=highest, higher number=lower privilege',
  })
  @IsNumber()
  @Min(0)
  level!: number;

  @ApiProperty({
    example: ['manager', 'editor'],
    required: false,
    description: 'Slugs of roles this role can assign',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignableRoles?: string[];
}
