"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptographyModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const encrypter_1 = require("../../domain/auth/application/cryptography/encrypter");
const hash_comparer_1 = require("../../domain/auth/application/cryptography/hash-comparer");
const hash_generator_1 = require("../../domain/auth/application/cryptography/hash-generator");
const secret_encrypter_1 = require("../../domain/auth/application/cryptography/secret-encrypter");
const token_validator_1 = require("../../domain/auth/application/cryptography/token-validator");
const jwt_encrypter_1 = require("./jwt-encrypter");
const bcrypt_hasher_1 = require("./bcrypt-hasher");
const aes_secret_encrypter_1 = require("./aes-secret-encrypter");
const jwt_token_validator_1 = require("./jwt-token-validator");
let CryptographyModule = class CryptographyModule {
};
exports.CryptographyModule = CryptographyModule;
exports.CryptographyModule = CryptographyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET') || 'your-secret-key',
                    signOptions: {
                        algorithm: 'HS256',
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [
            { provide: encrypter_1.Encrypter, useClass: jwt_encrypter_1.JwtEncrypter },
            { provide: hash_comparer_1.HashComparer, useClass: bcrypt_hasher_1.BcryptHasher },
            { provide: hash_generator_1.HashGenerator, useClass: bcrypt_hasher_1.BcryptHasher },
            { provide: secret_encrypter_1.SecretEncrypter, useClass: aes_secret_encrypter_1.AesSecretEncrypter },
            { provide: token_validator_1.TokenValidator, useClass: jwt_token_validator_1.JwtTokenValidator }
        ],
        exports: [encrypter_1.Encrypter, hash_comparer_1.HashComparer, hash_generator_1.HashGenerator, secret_encrypter_1.SecretEncrypter, token_validator_1.TokenValidator]
    })
], CryptographyModule);
