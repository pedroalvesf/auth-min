import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  TokenValidator,
  TokenPayload,
} from '@/domain/auth/application/cryptography/token-validator';

@Injectable()
export class JwtTokenValidator implements TokenValidator {
  constructor(private jwtService: JwtService) {}

  async validate(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = await this.jwtService.verifyAsync(token);

      return {
        sub: decoded.sub,
        email: decoded.email,
        type: decoded.type,
        deviceId: decoded.deviceId,
      };
    } catch (error) {
      return null;
    }
  }
}
