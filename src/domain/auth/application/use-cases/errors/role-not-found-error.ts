import { UseCaseError } from '@/core/errors/use-case-error';

export class RoleNotFoundError extends Error implements UseCaseError {
  constructor(roleId: string) {
    super(`Role "${roleId}" not found`);
  }
}
