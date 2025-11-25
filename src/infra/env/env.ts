import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must have at least 32 characters'),
  PORT: z.coerce.number(),
  SECRET_ENCRYPTION_KEY: z.string().optional(),
});
