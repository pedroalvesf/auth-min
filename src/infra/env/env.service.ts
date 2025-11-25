import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { envSchema } from './env';
import { z } from 'zod';

@Injectable()
export class EnvService {
  constructor(
    private configService: ConfigService<z.infer<typeof envSchema>, true>
  ) {}

  get<T extends keyof z.infer<typeof envSchema>>(key: T) {
    return this.configService.get<z.infer<typeof envSchema>[T]>(key, {
      infer: true,
    });
  }
}
