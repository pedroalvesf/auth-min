import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Encrypter } from '@/domain/auth/application/cryptography/encrypter';
import { HashComparer } from '@/domain/auth/application/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/auth/application/cryptography/hash-generator';
import { SecretEncrypter } from '@/domain/auth/application/cryptography/secret-encrypter';
import { TokenValidator } from '@/domain/auth/application/cryptography/token-validator';

import { JwtEncrypter } from './jwt-encrypter';
import { BcryptHasher } from './bcrypt-hasher';
import { AesSecretEncrypter } from './aes-secret-encrypter';
import { JwtTokenValidator } from './jwt-token-validator';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          algorithm: 'HS256',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
    { provide: SecretEncrypter, useClass: AesSecretEncrypter },
    { provide: TokenValidator, useClass: JwtTokenValidator },
  ],
  exports: [
    Encrypter,
    HashComparer,
    HashGenerator,
    SecretEncrypter,
    TokenValidator,
  ],
})
export class CryptographyModule {}
