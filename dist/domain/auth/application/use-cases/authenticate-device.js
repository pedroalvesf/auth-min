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
exports.AuthenticateDeviceUseCase = void 0;
const common_1 = require("@nestjs/common");
const either_1 = require("../../../../core/either");
const refresh_token_1 = require("../../enterprise/entities/refresh-token");
const access_token_1 = require("../../enterprise/entities/access-token");
const hash_comparer_1 = require("../cryptography/hash-comparer");
const encrypter_1 = require("../cryptography/encrypter");
const unique_entity_id_1 = require("../../../../core/entities/unique-entity-id");
const devices_repository_1 = require("../repositories/devices-repository");
const users_repository_1 = require("../repositories/users-repository");
const refresh_token_repository_1 = require("../repositories/refresh-token-repository");
const wrong_credentials_error_1 = require("./errors/wrong-credentials-error");
let AuthenticateDeviceUseCase = class AuthenticateDeviceUseCase {
    constructor(devicesRepository, usersRepository, refreshTokenRepository, hashComparer, encrypter) {
        this.devicesRepository = devicesRepository;
        this.usersRepository = usersRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.hashComparer = hashComparer;
        this.encrypter = encrypter;
    }
    async execute({ password, device, }) {
        const user = await this.usersRepository.findById(device.userId.toString());
        if (!user) {
            return (0, either_1.left)(new wrong_credentials_error_1.WrongCredentialsError());
        }
        const isPasswordValid = await this.hashComparer.compare(password, user.password);
        if (isPasswordValid) {
            const result = await this.authenticateUser(user, device);
            return (0, either_1.right)(result);
        }
        return (0, either_1.left)(new wrong_credentials_error_1.WrongCredentialsError());
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
};
exports.AuthenticateDeviceUseCase = AuthenticateDeviceUseCase;
exports.AuthenticateDeviceUseCase = AuthenticateDeviceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [devices_repository_1.DevicesRepository,
        users_repository_1.UsersRepository,
        refresh_token_repository_1.RefreshTokenRepository,
        hash_comparer_1.HashComparer,
        encrypter_1.Encrypter])
], AuthenticateDeviceUseCase);
