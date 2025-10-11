import { createHmac } from 'crypto'

export interface JwtPayload {
  sub: string
  iat: number
  exp: number
  [key: string]: any
}

export class JwtService {
  private static readonly HEADER = { alg: 'HS256', typ: 'JWT' }

  static sign(payload: Omit<JwtPayload, 'iat' | 'exp'>, secret: string, expiresInSeconds = 3600): string {
    const now = Math.floor(Date.now() / 1000)
    const fullPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds
    } as JwtPayload

    const header = this.base64UrlEncode(JSON.stringify(this.HEADER))
    const body = this.base64UrlEncode(JSON.stringify(fullPayload))
    const signature = this.createSignature(`${header}.${body}`, secret)
    
    return `${header}.${body}.${signature}`
  }

  static verify(token: string, secret: string): JwtPayload | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }

      const [headerB64, payloadB64, signature] = parts
      const expectedSignature = this.createSignature(`${headerB64}.${payloadB64}`, secret)

      if (signature !== expectedSignature) {
        return null
      }

      const payload = JSON.parse(this.base64UrlDecode(payloadB64)) as JwtPayload
      
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp < now) {
        return null
      }

      return payload
    } catch {
      return null
    }
  }

  private static createSignature(data: string, secret: string): string {
    return createHmac('sha256', secret)
      .update(data)
      .digest('base64url')
  }

  private static base64UrlEncode(data: string): string {
    return Buffer.from(data).toString('base64url')
  }

  private static base64UrlDecode(data: string): string {
    return Buffer.from(data, 'base64url').toString()
  }
}