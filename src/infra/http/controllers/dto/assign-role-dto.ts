import { IsString, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsString()
  @IsUUID()
  userId!: string;

  @IsString()
  @IsUUID()
  roleId!: string;
}
