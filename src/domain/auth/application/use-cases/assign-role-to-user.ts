import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { UsersRepository } from '../repositories/users-repository';
import { RolesRepository } from '../repositories/roles-repository';
import { UserNotFoundError } from './errors/user-not-found-error';
import { RoleNotFoundError } from './errors/role-not-found-error';

interface AssignRoleToUserUseCaseRequest {
  userId: string;
  roleId: string;
  assignedBy?: string;
}

type AssignRoleToUserUseCaseResponse = Either<
  UserNotFoundError | RoleNotFoundError,
  {
    success: boolean;
  }
>;

@Injectable()
export class AssignRoleToUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private rolesRepository: RolesRepository
  ) {}

  async execute({
    userId,
    roleId,
    assignedBy,
  }: AssignRoleToUserUseCaseRequest): Promise<AssignRoleToUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    const role = await this.rolesRepository.findById(roleId);
    if (!role) {
      return left(new RoleNotFoundError(roleId));
    }

    await this.usersRepository.assignRole(userId, roleId, assignedBy);

    return right({ success: true });
  }
}
