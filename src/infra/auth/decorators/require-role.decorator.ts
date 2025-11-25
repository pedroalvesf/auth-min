import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'requiredRole';

export const RequireRole = (...roles: string[]) => SetMetadata(ROLE_KEY, roles);
