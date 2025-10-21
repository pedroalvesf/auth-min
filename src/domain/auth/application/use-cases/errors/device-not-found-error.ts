import { UseCaseError } from "@/core/errors/use-case-error";

export class DeviceNotFoundError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Device not found: "${identifier}".`);
  }
}
