"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupContainer = setupContainer;
const client_1 = require("@prisma/client");
const container_1 = require("../../core/container/container");
const tokens_1 = require("../../core/container/tokens");
// Repositories
const prisma_users_repository_1 = require("../database/prisma/repositories/prisma-users-repository");
const prisma_devices_repository_1 = require("../database/prisma/repositories/prisma-devices-repository");
const prisma_refresh_token_repository_1 = require("../database/prisma/repositories/prisma-refresh-token-repository");
const prisma_access_token_repository_1 = require("../database/prisma/repositories/prisma-access-token-repository");
// Cryptography
const bcrypt_hasher_1 = require("../cryptography/bcrypt-hasher");
const jwt_encrypter_1 = require("../cryptography/jwt-encrypter");
const jwt_token_validator_1 = require("../cryptography/jwt-token-validator");
// Use Cases
const authenticate_device_1 = require("../../domain/auth/application/use-cases/authenticate-device");
const validate_token_1 = require("../../domain/auth/application/use-cases/validate-token");
const refresh_access_token_1 = require("../../domain/auth/application/use-cases/refresh-access-token");
const register_user_1 = require("../../domain/auth/application/use-cases/register-user");
function setupContainer() {
    // Infrastructure
    container_1.container.register(tokens_1.TOKENS.PRISMA_CLIENT, new client_1.PrismaClient());
    container_1.container.register(tokens_1.TOKENS.JWT_SECRET, process.env.JWT_SECRET || 'your-secret-key');
    // Repositories
    container_1.container.registerClass(tokens_1.TOKENS.USERS_REPOSITORY, prisma_users_repository_1.PrismaUsersRepository, [tokens_1.TOKENS.PRISMA_CLIENT]);
    container_1.container.registerClass(tokens_1.TOKENS.DEVICES_REPOSITORY, prisma_devices_repository_1.PrismaDevicesRepository, [tokens_1.TOKENS.PRISMA_CLIENT]);
    container_1.container.registerClass(tokens_1.TOKENS.REFRESH_TOKEN_REPOSITORY, prisma_refresh_token_repository_1.PrismaRefreshTokenRepository, [tokens_1.TOKENS.PRISMA_CLIENT]);
    container_1.container.registerClass(tokens_1.TOKENS.ACCESS_TOKEN_REPOSITORY, prisma_access_token_repository_1.PrismaAccessTokenRepository, [tokens_1.TOKENS.PRISMA_CLIENT]);
    // Cryptography (usando o mesmo hasher para comparer e generator)
    container_1.container.registerClass(tokens_1.TOKENS.HASH_COMPARER, bcrypt_hasher_1.BcryptHasher, []);
    container_1.container.registerClass(tokens_1.TOKENS.HASH_GENERATOR, bcrypt_hasher_1.BcryptHasher, []);
    container_1.container.registerClass(tokens_1.TOKENS.ENCRYPTER, jwt_encrypter_1.JwtEncrypter, [tokens_1.TOKENS.JWT_SECRET]);
    container_1.container.registerClass(tokens_1.TOKENS.TOKEN_VALIDATOR, jwt_token_validator_1.JwtTokenValidator, [tokens_1.TOKENS.JWT_SECRET]);
    // Use Cases
    container_1.container.registerClass(tokens_1.TOKENS.AUTHENTICATE_DEVICE_USE_CASE, authenticate_device_1.AuthenticateDeviceUseCase, [
        tokens_1.TOKENS.DEVICES_REPOSITORY,
        tokens_1.TOKENS.USERS_REPOSITORY,
        tokens_1.TOKENS.REFRESH_TOKEN_REPOSITORY,
        tokens_1.TOKENS.HASH_COMPARER,
        tokens_1.TOKENS.ENCRYPTER,
    ]);
    container_1.container.registerClass(tokens_1.TOKENS.VALIDATE_TOKEN_USE_CASE, validate_token_1.ValidateTokenUseCase, [
        tokens_1.TOKENS.USERS_REPOSITORY,
        tokens_1.TOKENS.ACCESS_TOKEN_REPOSITORY,
        tokens_1.TOKENS.TOKEN_VALIDATOR,
    ]);
    container_1.container.registerClass(tokens_1.TOKENS.REFRESH_ACCESS_TOKEN_USE_CASE, refresh_access_token_1.RefreshAccessTokenUseCase, [
        tokens_1.TOKENS.USERS_REPOSITORY,
        tokens_1.TOKENS.REFRESH_TOKEN_REPOSITORY,
        tokens_1.TOKENS.ENCRYPTER,
    ]);
    container_1.container.registerClass(tokens_1.TOKENS.REGISTER_USER_USE_CASE, register_user_1.RegisterUserUseCase, [
        tokens_1.TOKENS.USERS_REPOSITORY,
        tokens_1.TOKENS.HASH_GENERATOR,
    ]);
}
