import { HashComparer } from '@/domain/auth/application/cryptography/hash-comparer';

export class FakeHashComparer implements HashComparer {
  async compare(plain: string, hash: string): Promise<boolean> {
    return plain === hash;
  }
}
