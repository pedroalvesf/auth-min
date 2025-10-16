export abstract class Encrypter {
  abstract encrypt(payload: { sub: string; deviceId: string }): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}
