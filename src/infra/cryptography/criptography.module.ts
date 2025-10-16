import { Module } from '@nestjs/common'

import { Encrypter } from '@/domain/auth/application/cryptography/encrypter'
import { HashComparer } from '@/domain/auth/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/auth/application/cryptography/hash-generator'
import { SecretEncrypter } from '@/domain/auth/application/cryptography/secret-encrypter'

import { JwtEncrypter } from './jwt-encrypter'
import { BcryptHasher } from './bcript-hasher'
import { AesSecretEncrypter } from './aes-secret-encrypter'

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
    { provide: SecretEncrypter, useClass: AesSecretEncrypter }
  ],
  exports: [Encrypter, HashComparer, HashGenerator, SecretEncrypter]
})
export class CryptographyModule {}
