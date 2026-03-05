import { PrismaService } from '../../src/infra/database/prisma/prisma.service';

export class DatabaseHelper {
  constructor(private prisma: PrismaService) {}

  async createUserWithRole(
    userData: { email: string; password: string; name: string },
    roleSlug: 'admin' | 'manager' | 'user' = 'user'
  ) {
    // Create user first
    const user = await this.prisma.user.create({
      data: userData,
    });

    // Assign role to user
    await this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: `role-${roleSlug}`,
        assignedAt: new Date(),
        assignedBy: 'system', // For test purposes
      },
    });

    return user;
  }

  async cleanup(): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.auditLog.deleteMany(),
      this.prisma.accessToken.deleteMany(),
      this.prisma.loginHistory.deleteMany(),
      this.prisma.refreshToken.deleteMany(),
      this.prisma.device.deleteMany(),
      this.prisma.userRole.deleteMany(),
      this.prisma.rolePermission.deleteMany(),
      this.prisma.user.deleteMany(),
      this.prisma.role.deleteMany(),
      this.prisma.permission.deleteMany(),
    ]);
  }

  async seed(): Promise<void> {
    // Create basic roles
    await this.prisma.role.createMany({
      data: [
        {
          id: 'role-admin',
          name: 'Admin',
          slug: 'admin',
          level: 0,
          assignableRoles: ['manager', 'user'],
        },
        {
          id: 'role-manager',
          name: 'Manager',
          slug: 'manager',
          level: 1,
          assignableRoles: ['user'],
        },
        {
          id: 'role-user',
          name: 'User',
          slug: 'user',
          level: 2,
          assignableRoles: [],
        },
      ],
    });

    // Create basic permissions
    await this.prisma.permission.createMany({
      data: [
        {
          id: 'perm-users-read',
          name: 'Read Users',
          slug: 'users.read',
          resource: 'users',
          action: 'read',
        },
        {
          id: 'perm-users-create',
          name: 'Create Users',
          slug: 'users.create',
          resource: 'users',
          action: 'create',
        },
        {
          id: 'perm-roles-read',
          name: 'Read Roles',
          slug: 'roles.read',
          resource: 'roles',
          action: 'read',
        },
        {
          id: 'perm-roles-create',
          name: 'Create Roles',
          slug: 'roles.create',
          resource: 'roles',
          action: 'create',
        },
      ],
    });

    // Assign permissions to roles
    await this.prisma.rolePermission.createMany({
      data: [
        // Admin gets all permissions
        {
          id: 'rp-admin-users-read',
          roleId: 'role-admin',
          permissionId: 'perm-users-read',
        },
        {
          id: 'rp-admin-users-create',
          roleId: 'role-admin',
          permissionId: 'perm-users-create',
        },
        {
          id: 'rp-admin-roles-read',
          roleId: 'role-admin',
          permissionId: 'perm-roles-read',
        },
        {
          id: 'rp-admin-roles-create',
          roleId: 'role-admin',
          permissionId: 'perm-roles-create',
        },
        // Manager gets limited permissions
        {
          id: 'rp-manager-users-read',
          roleId: 'role-manager',
          permissionId: 'perm-users-read',
        },
        // User gets minimal permissions (none for now)
      ],
    });
  }
}
