import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { Role } from '../../enterprise/entities/role';
import { RolesRepository } from '../repositories/roles-repository';
import { RoleAlreadyExistsError } from './errors/role-already-exists-error';

interface CreateRoleUseCaseRequest {
  name: string;
  description?: string;
  level: number;
  assignableRoles?: string[];
}

type CreateRoleUseCaseResponse = Either<
  RoleAlreadyExistsError,
  {
    role: Role;
  }
>;

@Injectable()
export class CreateRoleUseCase {
  constructor(private rolesRepository: RolesRepository) {}

  async execute({
    name,
    description,
    level,
    assignableRoles,
  }: CreateRoleUseCaseRequest): Promise<CreateRoleUseCaseResponse> {
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const roleWithSameName = await this.rolesRepository.findByName(name);
    if (roleWithSameName) {
      return left(new RoleAlreadyExistsError(name));
    }

    const roleWithSameSlug = await this.rolesRepository.findBySlug(slug);
    if (roleWithSameSlug) {
      return left(new RoleAlreadyExistsError(slug));
    }

    const role = Role.create({
      name,
      slug,
      description,
      level,
      assignableRoles: assignableRoles ?? [],
    });

    await this.rolesRepository.create(role);

    return right({ role });
  }
}
