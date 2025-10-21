"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AesSecretEncrypter = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let AesSecretEncrypter = class AesSecretEncrypter {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        const key = process.env.SECRET_ENCRYPTION_KEY || 'default-secret-key-for-2fa';
        this.secretKey = (0, crypto_1.createHash)('sha256').update(key).digest();
    }
    async encrypt(plainText) {
        const iv = (0, crypto_1.randomBytes)(16);
        const cipher = (0, crypto_1.createCipheriv)(this.algorithm, this.secretKey, iv);
        let encrypted = cipher.update(plainText, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    async decrypt(encryptedText) {
        const [ivHex, encrypted] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = (0, crypto_1.createDecipheriv)(this.algorithm, this.secretKey, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
};
exports.AesSecretEncrypter = AesSecretEncrypter;
exports.AesSecretEncrypter = AesSecretEncrypter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AesSecretEncrypter);
