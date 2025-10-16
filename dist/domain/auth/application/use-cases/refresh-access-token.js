"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshAccessTokenUseCase = void 0;
const either_1 = require("@/core/either");
const access_token_1 = require("@/domain/auth/enterprise/entities/access-token");
const unique_entity_id_1 = require("@/core/entities/unique-entity-id");
const refresh_token_expired_error_1 = require("./errors/refresh-token-expired-error");
const user_not_found_error_1 = require("./errors/user-not-found-error");
const refresh_token_not_found_error_1 = require("./errors/refresh-token-not-found-error");
class RefreshAccessTokenUseCase {
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
        const user = await this.userRepository.findById(refreshTokenEntity.userId);
        if (!user) {
            return (0, either_1.left)(new user_not_found_error_1.UserNotFoundError());
        }
        const { accessToken } = await this.encrypter.encrypt({
            sub: user.id.toString(),
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
}
exports.RefreshAccessTokenUseCase = RefreshAccessTokenUseCase;
