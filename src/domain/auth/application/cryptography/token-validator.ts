export interface TokenPayload {
  sub: string;
  email?: string;
  type?: string;
  deviceId?: string;
}

export abstract class TokenValidator {
  abstract validate(token: string): Promise<TokenPayload | null>;
}
