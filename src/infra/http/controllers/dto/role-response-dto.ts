import { ApiProperty } from "@nestjs/swagger";

export class RoleResponseDto {
  @ApiProperty({
    description: 'Role unique identifier',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id!: string;

  @ApiProperty({
    description: 'Role name',
    example: 'Administrator',
  })
  name!: string;

  @ApiProperty({
    description: 'Role slug for programmatic usage',
    example: 'admin',
  })
  slug!: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Full system access with all permissions',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Role level (0=highest, higher number=lower privilege)',
    example: 0,
  })
  level!: number;

  @ApiProperty({
    description: 'Roles that this role can assign to users',
    example: ['manager', 'editor'],
    type: [String],
    required: false,
  })
  assignableRoles?: string[];

  @ApiProperty({
    description: 'Role creation date',
    example: '2023-11-17T10:00:00Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Role last update date',
    example: '2023-11-17T10:00:00Z',
  })
  updatedAt!: string;
}

export class PermissionResponseDto {
  @ApiProperty({
    description: 'Permission unique identifier',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id!: string;

  @ApiProperty({
    description: 'Permission name',
    example: 'Create Users',
  })
  name!: string;

  @ApiProperty({
    description: 'Permission slug for programmatic usage',
    example: 'users.create',
  })
  slug!: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'Allows creation of new user accounts',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Resource the permission applies to',
    example: 'users',
  })
  resource!: string;

  @ApiProperty({
    description: 'Action the permission allows',
    example: 'create',
    enum: ['create', 'read', 'update', 'delete', 'manage'],
  })
  action!: string;

  @ApiProperty({
    description: 'Permission creation date',
    example: '2023-11-17T10:00:00Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Permission last update date',
    example: '2023-11-17T10:00:00Z',
  })
  updatedAt!: string;
}