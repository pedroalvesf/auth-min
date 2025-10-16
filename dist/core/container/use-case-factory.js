"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegisterUserUseCase = exports.getRefreshAccessTokenUseCase = exports.getValidateTokenUseCase = exports.getAuthenticateDeviceUseCase = exports.UseCaseFactory = void 0;
const container_1 = require("./container");
const tokens_1 = require("./tokens");
class UseCaseFactory {
    static getAuthenticateDeviceUseCase() {
        return container_1.container.resolve(tokens_1.TOKENS.AUTHENTICATE_DEVICE_USE_CASE);
    }
    static getValidateTokenUseCase() {
        return container_1.container.resolve(tokens_1.TOKENS.VALIDATE_TOKEN_USE_CASE);
    }
    static getRefreshAccessTokenUseCase() {
        return container_1.container.resolve(tokens_1.TOKENS.REFRESH_ACCESS_TOKEN_USE_CASE);
    }
    static getRegisterUserUseCase() {
        return container_1.container.resolve(tokens_1.TOKENS.REGISTER_USER_USE_CASE);
    }
}
exports.UseCaseFactory = UseCaseFactory;
// Helper functions para uso direto
const getAuthenticateDeviceUseCase = () => UseCaseFactory.getAuthenticateDeviceUseCase();
exports.getAuthenticateDeviceUseCase = getAuthenticateDeviceUseCase;
const getValidateTokenUseCase = () => UseCaseFactory.getValidateTokenUseCase();
exports.getValidateTokenUseCase = getValidateTokenUseCase;
const getRefreshAccessTokenUseCase = () => UseCaseFactory.getRefreshAccessTokenUseCase();
exports.getRefreshAccessTokenUseCase = getRefreshAccessTokenUseCase;
const getRegisterUserUseCase = () => UseCaseFactory.getRegisterUserUseCase();
exports.getRegisterUserUseCase = getRegisterUserUseCase;
