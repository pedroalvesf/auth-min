export abstract class Encrypter {
  abstract encrypt(payload: Record<string, unknown>): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}
