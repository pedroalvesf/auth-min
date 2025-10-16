"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateDeviceUseCase = void 0;
const either_1 = require("@/core/either");
const refresh_token_1 = require("../../enterprise/entities/refresh-token");
const access_token_1 = require("../../enterprise/entities/access-token");
const unique_entity_id_1 = require("@/core/entities/unique-entity-id");
const invalid_credentials_error_1 = require("./errors/invalid-credentials-error");
class AuthenticateDeviceUseCase {
    constructor(devicesRepository, usersRepository, refreshTokenRepository, hashComparer, encrypter) {
        this.devicesRepository = devicesRepository;
        this.usersRepository = usersRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.hashComparer = hashComparer;
        this.encrypter = encrypter;
    }
    async execute({ password, device, }) {
        const user = await this.usersRepository.findById(device.userId);
        if (!user) {
            return (0, either_1.left)(new invalid_credentials_error_1.InvalidCredentialsError());
        }
        const isPasswordValid = await this.hashComparer.compare(password, user.password);
        if (isPasswordValid) {
            const result = await this.authenticateUser(user, device);
            return (0, either_1.right)(result);
        }
        return (0, either_1.left)(new invalid_credentials_error_1.InvalidCredentialsError());
    }
    async authenticateUser(user, device) {
        const updatedDevice = await this.getOrCreateDevice(device);
        const { accessToken, refreshToken } = await this.encrypter.encrypt({
            sub: user.id.toString(),
            deviceId: updatedDevice.id.toString(),
        });
        const accessTokenEntity = access_token_1.AccessToken.create({
            userId: new unique_entity_id_1.UniqueEntityID(user.id.toString()),
            token: accessToken,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            revoked: false,
        });
        const refreshTokenEntity = refresh_token_1.RefreshToken.create({
            userId: new unique_entity_id_1.UniqueEntityID(user.id.toString()),
            deviceId: updatedDevice.id,
            token: refreshToken,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revoked: false,
        });
        await this.refreshTokenRepository.save(refreshTokenEntity);
        user.sign();
        await this.usersRepository.save(user);
        return {
            accessToken: accessTokenEntity,
            refreshToken: refreshTokenEntity,
        };
    }
    async getOrCreateDevice(device) {
        const repoDevice = await this.devicesRepository.findByUserIdIp(device.userId.toString(), device.ipAddress);
        if (!repoDevice ||
            repoDevice.browser !== device.browser ||
            repoDevice.operatingSystem !== device.operatingSystem ||
            repoDevice.type !== device.type) {
            device.lastLogin = new Date();
            await this.devicesRepository.create(device);
            return device;
        }
        repoDevice.lastLogin = new Date();
        await this.devicesRepository.save(repoDevice);
        return repoDevice;
    }
}
exports.AuthenticateDeviceUseCase = AuthenticateDeviceUseCase;
