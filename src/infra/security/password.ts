import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

export class PasswordService {
  private static readonly SALT_LENGTH = 16
  private static readonly HASH_LENGTH = 32

  static async hash(password: string): Promise<string> {
    const salt = randomBytes(this.SALT_LENGTH)
    const hash = await scryptAsync(password, salt, this.HASH_LENGTH) as Buffer
    return `${salt.toString('hex')}:${hash.toString('hex')}`
  }

  static async verify(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const [saltHex, hashHex] = hashedPassword.split(':')
      
      if (!saltHex || !hashHex) {
        return false
      }

      const salt = Buffer.from(saltHex, 'hex')
      const hash = Buffer.from(hashHex, 'hex')
      const verifyHash = await scryptAsync(password, salt, this.HASH_LENGTH) as Buffer

      return timingSafeEqual(hash, verifyHash)
    } catch {
      return false
    }
  }
}