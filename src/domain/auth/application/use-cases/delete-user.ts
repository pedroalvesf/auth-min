import { Injectable } from '@nestjs/common';
import { Either, left, right } from '../../../../core/either';
import { UsersRepository } from '@/domain/auth/application/repositories/users-repository';
import { UserNotFoundError } from './errors/user-not-found-error';

interface DeleteUserUseCaseRequest {
  userId: string;
}

type DeleteUserUseCaseResponse = Either<
  UserNotFoundError,
  {
    message: string;
  }
>;

@Injectable()
export class DeleteUserUseCase {
  constructor(private userRepository: UsersRepository) {}

  async execute({
    userId,
  }: DeleteUserUseCaseRequest): Promise<DeleteUserUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    await this.userRepository.delete(userId);

    return right({ message: 'User deleted successfully' });
  }
}
