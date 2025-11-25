import {
  TokenValidator,
  TokenPayload,
} from '@/domain/auth/application/cryptography/token-validator';

export class FakeTokenValidator implements TokenValidator {
  async validate(token: string): Promise<TokenPayload | null> {
    if (token === 'invalid-token') {
      return null;
    }

    if (token === 'expired-token') {
      return null;
    }

    if (token === 'malformed-token') {
      return null;
    }

    if (token === 'refresh-token') {
      return {
        sub: 'user-1',
        type: 'refresh',
      };
    }

    if (token === 'valid-token') {
      return {
        sub: 'user-1',
        email: 'john@example.com',
        type: 'access',
      };
    }

    if (token === 'token-without-sub') {
      return {
        sub: '',
        email: 'john@example.com',
        type: 'access',
      };
    }

    if (token === 'token-non-existent-user') {
      return {
        sub: 'non-existent-user',
        email: 'john@example.com',
        type: 'access',
      };
    }

    return null;
  }
}
