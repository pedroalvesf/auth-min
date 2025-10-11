import { Either, left, right } from '../../../../core/either'
import { JwtService } from '../../../../infra/security/jwt'
import { UserRepository } from '../../../repositories/user-repository'
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id'
import { InvalidTokenError } from './errors/invalid-token-error'

export interface ValidateTokenResult {
  userId: string
  email: string
  name?: string
}

export class ValidateTokenUseCase {
  constructor(
    private userRepository: UserRepository,
    private jwtSecret: string
  ) {}

  async execute(token: string): Promise<Either<InvalidTokenError, ValidateTokenResult>> {
    const payload = JwtService.verify(token, this.jwtSecret)
    
    if (!payload || payload.type === 'refresh') {
      return left(new InvalidTokenError())
    }

    const user = await this.userRepository.findById(new UniqueEntityID(payload.sub))
    
    if (!user) {
      return left(new InvalidTokenError())
    }

    return right({
      userId: user.id.toString(),
      email: user.email,
      name: user.name
    })
  }
}