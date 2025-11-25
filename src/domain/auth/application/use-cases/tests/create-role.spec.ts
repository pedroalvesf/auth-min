import { InMemoryRolesRepository } from '@/test/repositories/in-memory-roles-repository';
import { CreateRoleUseCase } from '../create-role';
import { RoleAlreadyExistsError } from '../errors/role-already-exists-error';

let rolesRepository: InMemoryRolesRepository;
let sut: CreateRoleUseCase;

describe('Create Role', () => {
  beforeEach(() => {
    rolesRepository = new InMemoryRolesRepository();
    sut = new CreateRoleUseCase(rolesRepository);
  });

  it('should be able to create a new role', async () => {
    const result = await sut.execute({
      name: 'Admin',
      description: 'Administrator role',
      level: 1,
      assignableRoles: ['user', 'moderator'],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.role.name).toBe('Admin');
      expect(result.value.role.slug).toBe('admin');
      expect(result.value.role.description).toBe('Administrator role');
      expect(result.value.role.level).toBe(1);
      expect(result.value.role.assignableRoles).toEqual(['user', 'moderator']);
    }
    expect(rolesRepository.items).toHaveLength(1);
  });

  it('should create role with auto-generated slug', async () => {
    const result = await sut.execute({
      name: 'Super Admin User',
      level: 1,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.role.slug).toBe('super-admin-user');
    }
  });

  it('should not be able to create a role with same name', async () => {
    await sut.execute({
      name: 'Admin',
      level: 1,
    });

    const result = await sut.execute({
      name: 'Admin',
      level: 2,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RoleAlreadyExistsError);
  });

  it('should not be able to create a role with same slug', async () => {
    await sut.execute({
      name: 'Admin User',
      level: 1,
    });

    const result = await sut.execute({
      name: 'admin-user', // Will generate same slug
      level: 2,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RoleAlreadyExistsError);
  });
});
