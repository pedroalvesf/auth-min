import { InMemoryPermissionsRepository } from '@/test/repositories/in-memory-permissions-repository';
import { makePermission } from '@/test/factories/make-permission';
import { ListPermissionsUseCase } from '../list-permissions';

let permissionsRepository: InMemoryPermissionsRepository;
let sut: ListPermissionsUseCase;

describe('List Permissions', () => {
  beforeEach(() => {
    permissionsRepository = new InMemoryPermissionsRepository();
    sut = new ListPermissionsUseCase(permissionsRepository);
  });

  it('should be able to list all permissions', async () => {
    const permission1 = makePermission({
      name: 'Read Users',
      resource: 'users',
      action: 'read',
    });
    const permission2 = makePermission({
      name: 'Write Posts',
      resource: 'posts',
      action: 'write',
    });
    const permission3 = makePermission({
      name: 'Delete Comments',
      resource: 'comments',
      action: 'delete',
    });

    await permissionsRepository.create(permission1);
    await permissionsRepository.create(permission2);
    await permissionsRepository.create(permission3);

    const result = await sut.execute();

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.permissions).toHaveLength(3);
      expect(result.value.permissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Read Users' }),
          expect.objectContaining({ name: 'Write Posts' }),
          expect.objectContaining({ name: 'Delete Comments' }),
        ])
      );
    }
  });

  it('should return empty array when no permissions exist', async () => {
    const result = await sut.execute();

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.permissions).toHaveLength(0);
      expect(result.value.permissions).toEqual([]);
    }
  });
});
