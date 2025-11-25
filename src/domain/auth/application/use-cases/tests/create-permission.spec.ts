import { InMemoryPermissionsRepository } from '@/test/repositories/in-memory-permissions-repository';
import { CreatePermissionUseCase } from '../create-permission';
import { PermissionAlreadyExistsError } from '../errors/permission-already-exists-error';

let permissionsRepository: InMemoryPermissionsRepository;
let sut: CreatePermissionUseCase;

describe('Create Permission', () => {
  beforeEach(() => {
    permissionsRepository = new InMemoryPermissionsRepository();
    sut = new CreatePermissionUseCase(permissionsRepository);
  });

  it('should be able to create a new permission', async () => {
    const result = await sut.execute({
      name: 'Read Users',
      description: 'Permission to read user data',
      resource: 'users',
      action: 'read',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.permission.name).toBe('Read Users');
      expect(result.value.permission.slug).toBe('users:read');
      expect(result.value.permission.description).toBe(
        'Permission to read user data'
      );
      expect(result.value.permission.resource).toBe('users');
      expect(result.value.permission.action).toBe('read');
    }
    expect(permissionsRepository.items).toHaveLength(1);
  });

  it('should create permission with auto-generated slug', async () => {
    const result = await sut.execute({
      name: 'Delete Posts',
      resource: 'posts',
      action: 'delete',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.permission.slug).toBe('posts:delete');
    }
  });

  it('should not be able to create permission with same resource and action', async () => {
    await sut.execute({
      name: 'Read Users',
      resource: 'users',
      action: 'read',
    });

    const result = await sut.execute({
      name: 'View Users', // Different name but same resource:action
      resource: 'users',
      action: 'read',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PermissionAlreadyExistsError);
  });
});
