import { InMemoryUsersRepository } from '@/test/repositories/in-memory-users-repository';
import { InMemoryRolesRepository } from '@/test/repositories/in-memory-roles-repository';
import { InMemoryPermissionsRepository } from '@/test/repositories/in-memory-permissions-repository';
import { makeUser } from '@/test/factories/make-user';
import { makeRole } from '@/test/factories/make-role';
import { makePermission } from '@/test/factories/make-permission';
import {
  setupUserRoleRelationship,
  addRoleToUserRepository,
} from '@/test/helpers/setup-user-role-permission';
import { CheckUserPermissionUseCase } from '../check-user-permission';
import { UserNotFoundError } from '../errors/user-not-found-error';

let usersRepository: InMemoryUsersRepository;
let rolesRepository: InMemoryRolesRepository;
let permissionsRepository: InMemoryPermissionsRepository;
let sut: CheckUserPermissionUseCase;

describe('Check User Permission', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    rolesRepository = new InMemoryRolesRepository();
    permissionsRepository = new InMemoryPermissionsRepository();
    sut = new CheckUserPermissionUseCase(
      usersRepository,
      permissionsRepository
    );
  });

  it('should return true when user has the required permission', async () => {
    // Create user, role, and permission
    const user = makeUser();
    const adminRole = makeRole({ name: 'Admin' });
    const readUsersPermission = makePermission({
      name: 'Read Users',
      slug: 'users:read',
      resource: 'users',
      action: 'read',
    });

    // Setup relationships
    await setupUserRoleRelationship(usersRepository, user, adminRole);
    await rolesRepository.create(adminRole);
    await permissionsRepository.create(readUsersPermission);
    permissionsRepository.addRolePermission(
      adminRole.id.toString(),
      readUsersPermission.id.toString()
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      resource: 'users',
      action: 'read',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.hasPermission).toBe(true);
      expect(result.value.reason).toBeUndefined();
    }
  });

  it('should return false when user does not have the required permission', async () => {
    const user = makeUser();
    const userRole = makeRole({ name: 'User' });
    const writeUsersPermission = makePermission({
      name: 'Write Users',
      slug: 'users:write',
      resource: 'users',
      action: 'write',
    });

    await setupUserRoleRelationship(usersRepository, user, userRole);
    await rolesRepository.create(userRole);
    await permissionsRepository.create(writeUsersPermission);
    permissionsRepository.addRolePermission(
      userRole.id.toString(),
      writeUsersPermission.id.toString()
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      resource: 'users',
      action: 'delete', // User only has 'write', not 'delete'
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.hasPermission).toBe(false);
      expect(result.value.reason).toBe('Missing permission: users:delete');
    }
  });

  it('should return false when user has no roles assigned', async () => {
    const user = makeUser();
    await usersRepository.create(user);

    const result = await sut.execute({
      userId: user.id.toString(),
      resource: 'users',
      action: 'read',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.hasPermission).toBe(false);
      expect(result.value.reason).toBe('User has no roles assigned');
    }
  });

  it('should return error when user does not exist', async () => {
    const result = await sut.execute({
      userId: 'non-existent-user',
      resource: 'users',
      action: 'read',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(UserNotFoundError);
  });

  it('should handle user with multiple roles and permissions', async () => {
    const user = makeUser();
    const adminRole = makeRole({ name: 'Admin' });
    const editorRole = makeRole({ name: 'Editor' });

    const readPermission = makePermission({
      name: 'Read Users',
      slug: 'users:read',
      resource: 'users',
      action: 'read',
    });

    const writePermission = makePermission({
      name: 'Write Posts',
      slug: 'posts:write',
      resource: 'posts',
      action: 'write',
    });

    // Setup user with first role
    await setupUserRoleRelationship(usersRepository, user, adminRole);

    // Add second role and assign it
    addRoleToUserRepository(usersRepository, editorRole);
    await usersRepository.assignRole(
      user.id.toString(),
      editorRole.id.toString()
    );

    // Save other entities
    await rolesRepository.create(adminRole);
    await rolesRepository.create(editorRole);
    await permissionsRepository.create(readPermission);
    await permissionsRepository.create(writePermission);
    permissionsRepository.addRolePermission(
      adminRole.id.toString(),
      readPermission.id.toString()
    );
    permissionsRepository.addRolePermission(
      editorRole.id.toString(),
      writePermission.id.toString()
    );

    const result = await sut.execute({
      userId: user.id.toString(),
      resource: 'posts',
      action: 'write',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.hasPermission).toBe(true);
    }
  });
});
