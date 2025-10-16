import { Encrypter } from '@/domain/auth/application/cryptography/encrypter'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private jwtService: JwtService) {}

  async encrypt(payload: Record<string, unknown>): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h'
    })

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d'
    })

    return {
      accessToken,
      refreshToken
    }
  }
}
