import { Injectable } from '@nestjs/common';
import { Either, right } from '@/core/either';
import { Role } from '../../enterprise/entities/role';
import { RolesRepository } from '../repositories/roles-repository';

type ListRolesUseCaseResponse = Either<
  never,
  {
    roles: Role[];
  }
>;

@Injectable()
export class ListRolesUseCase {
  constructor(private rolesRepository: RolesRepository) {}

  async execute(): Promise<ListRolesUseCaseResponse> {
    const roles = await this.rolesRepository.findMany();

    return right({ roles });
  }
}
