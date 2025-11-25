export class RefreshTokenExpiredError extends Error {
  constructor() {
    super('Refresh token expired');
  }
}
