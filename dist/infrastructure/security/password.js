"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
class PasswordService {
    static async hash(password) {
        const salt = (0, crypto_1.randomBytes)(this.SALT_LENGTH);
        const hash = await scryptAsync(password, salt, this.HASH_LENGTH);
        return `${salt.toString('hex')}:${hash.toString('hex')}`;
    }
    static async verify(password, hashedPassword) {
        try {
            const [saltHex, hashHex] = hashedPassword.split(':');
            if (!saltHex || !hashHex) {
                return false;
            }
            const salt = Buffer.from(saltHex, 'hex');
            const hash = Buffer.from(hashHex, 'hex');
            const verifyHash = await scryptAsync(password, salt, this.HASH_LENGTH);
            return (0, crypto_1.timingSafeEqual)(hash, verifyHash);
        }
        catch {
            return false;
        }
    }
}
exports.PasswordService = PasswordService;
PasswordService.SALT_LENGTH = 16;
PasswordService.HASH_LENGTH = 32;
