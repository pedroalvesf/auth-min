import { Injectable } from '@nestjs/common'
import { createCipher, createDecipher } from 'crypto'
import { SecretEncrypter } from '@/domain/auth/application/cryptography/secret-encrypter'

@Injectable()
export class AesSecretEncrypter implements SecretEncrypter {
  private readonly algorithm = 'aes-256-cbc'
  private readonly secretKey: string

  constructor() {
    this.secretKey = process.env.SECRET_ENCRYPTION_KEY || 'default-secret-key-for-2fa'
  }

  async encrypt(plainText: string): Promise<string> {
    const cipher = createCipher(this.algorithm, this.secretKey)
    let encrypted = cipher.update(plainText, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  }

  async decrypt(encryptedText: string): Promise<string> {
    const decipher = createDecipher(this.algorithm, this.secretKey)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }
}