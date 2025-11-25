import { InMemoryRolesRepository } from '@/test/repositories/in-memory-roles-repository';
import { makeRole } from '@/test/factories/make-role';
import { ListRolesUseCase } from '../list-roles';

let rolesRepository: InMemoryRolesRepository;
let sut: ListRolesUseCase;

describe('List Roles', () => {
  beforeEach(() => {
    rolesRepository = new InMemoryRolesRepository();
    sut = new ListRolesUseCase(rolesRepository);
  });

  it('should be able to list all roles', async () => {
    const role1 = makeRole({ name: 'Admin' });
    const role2 = makeRole({ name: 'User' });
    const role3 = makeRole({ name: 'Moderator' });

    await rolesRepository.create(role1);
    await rolesRepository.create(role2);
    await rolesRepository.create(role3);

    const result = await sut.execute();

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.roles).toHaveLength(3);
      expect(result.value.roles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Admin' }),
          expect.objectContaining({ name: 'User' }),
          expect.objectContaining({ name: 'Moderator' }),
        ])
      );
    }
  });

  it('should return empty array when no roles exist', async () => {
    const result = await sut.execute();

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.roles).toHaveLength(0);
      expect(result.value.roles).toEqual([]);
    }
  });
});
