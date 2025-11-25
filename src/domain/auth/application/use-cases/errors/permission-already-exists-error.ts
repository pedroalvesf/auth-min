import { UseCaseError } from '@/core/errors/use-case-error';

export class PermissionAlreadyExistsError
  extends Error
  implements UseCaseError
{
  constructor(identifier: string) {
    super(`Permission "${identifier}" already exists`);
  }
}
