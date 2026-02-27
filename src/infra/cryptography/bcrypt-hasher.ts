import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { HashComparer } from '@/domain/auth/application/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/auth/application/cryptography/hash-generator';

@Injectable()
export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = process.env.NODE_ENV === 'test' ? 1 : 10;

  hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash);
  }
}
