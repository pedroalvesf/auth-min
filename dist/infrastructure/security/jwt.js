"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const crypto_1 = require("crypto");
class JwtService {
    static sign(payload, secret, expiresInSeconds = 3600) {
        const now = Math.floor(Date.now() / 1000);
        const fullPayload = {
            ...payload,
            iat: now,
            exp: now + expiresInSeconds
        };
        const header = this.base64UrlEncode(JSON.stringify(this.HEADER));
        const body = this.base64UrlEncode(JSON.stringify(fullPayload));
        const signature = this.createSignature(`${header}.${body}`, secret);
        return `${header}.${body}.${signature}`;
    }
    static verify(token, secret) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }
            const [headerB64, payloadB64, signature] = parts;
            const expectedSignature = this.createSignature(`${headerB64}.${payloadB64}`, secret);
            if (signature !== expectedSignature) {
                return null;
            }
            const payload = JSON.parse(this.base64UrlDecode(payloadB64));
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp < now) {
                return null;
            }
            return payload;
        }
        catch {
            return null;
        }
    }
    static createSignature(data, secret) {
        return (0, crypto_1.createHmac)('sha256', secret)
            .update(data)
            .digest('base64url');
    }
    static base64UrlEncode(data) {
        return Buffer.from(data).toString('base64url');
    }
    static base64UrlDecode(data) {
        return Buffer.from(data, 'base64url').toString();
    }
}
exports.JwtService = JwtService;
JwtService.HEADER = { alg: 'HS256', typ: 'JWT' };
