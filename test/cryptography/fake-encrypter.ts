import { Encrypter } from '@/domain/auth/application/cryptography/encrypter';

export class FakeEncrypter implements Encrypter {
  async encrypt(payload: Record<string, unknown>): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return {
      accessToken: JSON.stringify(payload),
      refreshToken: `refresh-${JSON.stringify(payload)}`,
    };
  }
}
