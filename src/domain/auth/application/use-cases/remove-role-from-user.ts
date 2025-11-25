import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { UsersRepository } from '../repositories/users-repository';
import { RolesRepository } from '../repositories/roles-repository';
import { UserNotFoundError } from './errors/user-not-found-error';
import { RoleNotFoundError } from './errors/role-not-found-error';

interface RemoveRoleFromUserUseCaseRequest {
  userId: string;
  roleId: string;
}

type RemoveRoleFromUserUseCaseResponse = Either<
  UserNotFoundError | RoleNotFoundError,
  {
    success: boolean;
    message: string;
  }
>;

@Injectable()
export class RemoveRoleFromUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private rolesRepository: RolesRepository
  ) {}

  async execute({
    userId,
    roleId,
  }: RemoveRoleFromUserUseCaseRequest): Promise<RemoveRoleFromUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    const role = await this.rolesRepository.findById(roleId);
    if (!role) {
      return left(new RoleNotFoundError(roleId));
    }

    await this.usersRepository.removeRole(userId, roleId);

    return right({
      success: true,
      message: 'Role removed from user successfully',
    });
  }
}
