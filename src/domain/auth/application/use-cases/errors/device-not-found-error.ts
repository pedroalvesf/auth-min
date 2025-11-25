import { UseCaseError } from '@/core/errors/use-case-error';

export class DeviceNotFoundError extends Error implements UseCaseError {
  constructor(deviceId: string) {
    super(`Device not found: "${deviceId}".`);
  }
}
