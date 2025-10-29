import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { PERMISSIONS, ROLES } from './permissions.config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ====================================
  // 1. CRIAR PERMISSÕES (do arquivo de config)
  // ====================================
  console.log('📋 Creating permissions from config...');
  
  const createdPermissions: Record<string, any> = {};
  
  for (const permission of PERMISSIONS) {
    const created = await prisma.permission.upsert({
      where: { slug: permission.slug },
      update: {
        name: permission.name,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
      },
      create: permission,
    });
    createdPermissions[permission.slug] = created;
    console.log(`  ✅ ${permission.name} (${permission.slug})`);
  }

  console.log(`\n✅ Created ${PERMISSIONS.length} permissions\n`);

  // ====================================
  // 2. CRIAR ROLES (do arquivo de config)
  // ====================================
  console.log('👥 Creating roles from config...');

  const createdRoles: Record<string, any> = {};

  for (const roleConfig of ROLES) {
    // Criar o role
    const role = await prisma.role.upsert({
      where: { slug: roleConfig.slug },
      update: {
        name: roleConfig.name,
        description: roleConfig.description,
        level: roleConfig.level,
        assignableRoles: roleConfig.assignableRoles,
      },
      create: {
        name: roleConfig.name,
        slug: roleConfig.slug,
        description: roleConfig.description,
        level: roleConfig.level,
        assignableRoles: roleConfig.assignableRoles,
      },
    });
    createdRoles[roleConfig.slug] = role;
    console.log(`  ✅ ${roleConfig.name} (level ${roleConfig.level})`);

    // Atribuir permissões ao role
    for (const permSlug of roleConfig.permissions) {
      if (!createdPermissions[permSlug]) {
        console.warn(`  ⚠️  Permission "${permSlug}" not found for role "${roleConfig.slug}"`);
        continue;
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: createdPermissions[permSlug].id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: createdPermissions[permSlug].id,
        },
      });
    }
  }

  console.log(`\n✅ Created ${ROLES.length} roles with permissions\n`);

  // ====================================
  // 3. CRIAR USUÁRIOS DE TESTE
  // ====================================
  console.log('👤 Creating test users...');

  const hashedPassword = await hash('senha123', 8);

  // Super Admin User
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@authmin.com' },
    update: {},
    create: {
      email: 'superadmin@authmin.com',
      password: hashedPassword,
      name: 'Super Administrator',
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log('  ✅ superadmin@authmin.com (password: senha123)');

  // Atribuir role super-admin
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: createdRoles['super-admin'].id,
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: createdRoles['super-admin'].id,
      assignedBy: superAdminUser.id,
    },
  });

  // Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@authmin.com' },
    update: {},
    create: {
      email: 'admin@authmin.com',
      password: hashedPassword,
      name: 'Admin User',
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log('  ✅ admin@authmin.com (password: senha123)');

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: createdRoles['admin'].id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: createdRoles['admin'].id,
      assignedBy: superAdminUser.id,
    },
  });

  // Manager User
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@authmin.com' },
    update: {},
    create: {
      email: 'manager@authmin.com',
      password: hashedPassword,
      name: 'Manager User',
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log('  ✅ manager@authmin.com (password: senha123)');

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: managerUser.id,
        roleId: createdRoles['manager'].id,
      },
    },
    update: {},
    create: {
      userId: managerUser.id,
      roleId: createdRoles['manager'].id,
      assignedBy: adminUser.id,
    },
  });

  // Regular User (Viewer)
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@authmin.com' },
    update: {},
    create: {
      email: 'user@authmin.com',
      password: hashedPassword,
      name: 'Regular User',
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  console.log('  ✅ user@authmin.com (password: senha123)');

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: regularUser.id,
        roleId: createdRoles['viewer'].id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      roleId: createdRoles['viewer'].id,
      assignedBy: managerUser.id,
    },
  });

  console.log('\n✅ Created 4 test users with roles\n');

  // ====================================
  // 4. RESUMO
  // ====================================
  console.log('📊 Seed Summary:');
  console.log('=====================================');
  
  const totalPermissions = await prisma.permission.count();
  const totalRoles = await prisma.role.count();
  const totalUsers = await prisma.user.count();
  
  console.log(`✅ Permissions: ${totalPermissions}`);
  console.log(`✅ Roles: ${totalRoles}`);
  console.log(`✅ Users: ${totalUsers}`);
  console.log('=====================================\n');

  console.log('🎉 Database seeded successfully!\n');
  console.log('📝 Test Credentials:');
  console.log('-----------------------------------');
  console.log('Super Admin: superadmin@authmin.com');
  console.log('Admin:       admin@authmin.com');
  console.log('Manager:     manager@authmin.com');
  console.log('User:        user@authmin.com');
  console.log('Password:    senha123 (all users)');
  console.log('-----------------------------------\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

