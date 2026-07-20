export class RefreshTokenReuseError extends Error {
  constructor() {
    super('Refresh token reuse detected; session revoked');
  }
}
