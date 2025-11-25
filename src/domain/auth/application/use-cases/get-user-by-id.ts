import { Either, left, right } from '@/core/either';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users-repository';
import { UserNotFoundError } from './errors/user-not-found-error';
import { User } from '../../enterprise/entities/user';

interface GetUserByIdUseCaseRequest {
  userId: string;
}

type GetUserByIdUseCaseResponse = Either<
  UserNotFoundError,
  {
    user: User;
  }
>;

@Injectable()
export class GetUserByIdUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
  }: GetUserByIdUseCaseRequest): Promise<GetUserByIdUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    return right({ user });
  }
}
