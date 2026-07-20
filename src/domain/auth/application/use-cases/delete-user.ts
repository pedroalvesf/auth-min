import { Injectable } from '@nestjs/common';
import { Either, left, right } from '../../../../core/either';
import { UsersRepository } from '@/domain/auth/application/repositories/users-repository';
import { RefreshTokenRepository } from '@/domain/auth/application/repositories/refresh-token-repository';
import { DevicesRepository } from '@/domain/auth/application/repositories/devices-repository';
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
  constructor(
    private userRepository: UsersRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private devicesRepository: DevicesRepository
  ) {}

  async execute({
    userId,
  }: DeleteUserUseCaseRequest): Promise<DeleteUserUseCaseResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return left(new UserNotFoundError(userId));
    }

    // Soft-delete: preserva histórico, mas encerra o acesso.
    user.softDelete();
    await this.userRepository.save(user);

    // Revoga todas as sessões: refresh tokens e devices ativos.
    const refreshTokens = await this.refreshTokenRepository.findByUserId(
      userId
    );
    for (const token of refreshTokens) {
      if (token.isRevoked()) continue;
      token.revoke();
      await this.refreshTokenRepository.save(token);
    }

    const devices = await this.devicesRepository.findManyByUserId(userId);
    for (const device of devices) {
      if (!device.active) continue;
      device.deactivate();
      await this.devicesRepository.save(device);
    }

    return right({ message: 'User deleted successfully' });
  }
}
