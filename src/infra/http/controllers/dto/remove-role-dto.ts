import { IsString, IsUUID } from 'class-validator';

export class RemoveRoleDto {
  @IsString()
  @IsUUID()
  userId!: string;

  @IsString()
  @IsUUID()
  roleId!: string;
}
