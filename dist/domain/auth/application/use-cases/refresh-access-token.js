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
exports.RefreshAccessTokenUseCase = void 0;
const common_1 = require("@nestjs/common");
const either_1 = require("../../../../core/either");
const users_repository_1 = require("../repositories/users-repository");
const refresh_token_repository_1 = require("../repositories/refresh-token-repository");
const access_token_1 = require("../../enterprise/entities/access-token");
const encrypter_1 = require("../cryptography/encrypter");
const unique_entity_id_1 = require("../../../../core/entities/unique-entity-id");
const refresh_token_expired_error_1 = require("./errors/refresh-token-expired-error");
const user_not_found_error_1 = require("./errors/user-not-found-error");
const refresh_token_not_found_error_1 = require("./errors/refresh-token-not-found-error");
let RefreshAccessTokenUseCase = class RefreshAccessTokenUseCase {
    constructor(userRepository, refreshTokenRepository, encrypter) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.encrypter = encrypter;
    }
    async execute({ refreshToken, }) {
        const refreshTokenEntity = await this.refreshTokenRepository.findByToken(refreshToken);
        if (!refreshTokenEntity) {
            return (0, either_1.left)(new refresh_token_not_found_error_1.RefreshTokenNotFoundError());
        }
        if (refreshTokenEntity.isExpired()) {
            return (0, either_1.left)(new refresh_token_expired_error_1.RefreshTokenExpiredError());
        }
        const user = await this.userRepository.findById(refreshTokenEntity.userId.toString());
        if (!user) {
            return (0, either_1.left)(new user_not_found_error_1.UserNotFoundError(refreshTokenEntity.userId.toString()));
        }
        const { accessToken } = await this.encrypter.encrypt({
            sub: refreshTokenEntity.userId.toString(),
            deviceId: refreshTokenEntity.deviceId.toString(),
        });
        const newAccessTokenEntity = access_token_1.AccessToken.create({
            userId: new unique_entity_id_1.UniqueEntityID(user.id.toString()),
            token: accessToken,
            expiresAt: new Date(Date.now() + 900 * 1000),
            createdAt: new Date(),
            revoked: false,
        });
        await this.refreshTokenRepository.save(refreshTokenEntity);
        return (0, either_1.right)({
            accessToken: newAccessTokenEntity.token,
            refreshToken: refreshTokenEntity.token,
        });
    }
};
exports.RefreshAccessTokenUseCase = RefreshAccessTokenUseCase;
exports.RefreshAccessTokenUseCase = RefreshAccessTokenUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        refresh_token_repository_1.RefreshTokenRepository,
        encrypter_1.Encrypter])
], RefreshAccessTokenUseCase);
