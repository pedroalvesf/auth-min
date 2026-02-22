import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class RemoveRoleDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the user to remove the role from',
  })
  @IsString()
  @IsUUID()
  userId!: string;

  @ApiProperty({
    example: '650e8400-e29b-41d4-a716-446655440001',
    description: 'ID do role a ser removido',
  })
  @IsString()
  @IsUUID()
  roleId!: string;
}
