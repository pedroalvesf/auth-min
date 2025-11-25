import { Injectable } from '@nestjs/common';
import { Either, left, right } from '../../../../core/either';
import { User } from '../../enterprise/entities/user';
import { UsersRepository } from '@/domain/auth/application/repositories/users-repository';
import { HashGenerator } from '../cryptography/hash-generator';
import { UserAlreadyExistsError } from './errors/user-already-exists-error';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

interface CreateUserUseCaseRequest {
  email: string;
  password: string;
  name: string;
}

type CreateUserUseCaseResponse = Either<
  UserAlreadyExistsError,
  {
    user: User;
  }
>;

@Injectable()
export class CreateUserUseCase {
  constructor(
    private userRepository: UsersRepository,
    private hashGenerator: HashGenerator
  ) {}

  async execute({
    email,
    password,
    name,
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const userExists = await this.userRepository.findByEmail(email);

    if (userExists) {
      return left(new UserAlreadyExistsError());
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const user = User.create(
      {
        email,
        password: hashedPassword,
        name,
      },
      new UniqueEntityID(email)
    );

    await this.userRepository.create(user);

    return right({ user });
  }
}
