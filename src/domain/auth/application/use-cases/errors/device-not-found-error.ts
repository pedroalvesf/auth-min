export class DeviceNotFoundError extends Error {
  constructor() {
    super('Device not found');
    this.name = 'DeviceNotFoundError';
  }
}