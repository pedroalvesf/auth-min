export class UnauthorizedDeviceAccessError extends Error {
  constructor() {
    super('Unauthorized access to device');
    this.name = 'UnauthorizedDeviceAccessError';
  }
}
