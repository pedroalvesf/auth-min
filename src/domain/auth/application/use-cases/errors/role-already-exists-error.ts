import { UseCaseError } from '@/core/errors/use-case-error';

export class RoleAlreadyExistsError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Role "${identifier}" already exists`);
  }
}
