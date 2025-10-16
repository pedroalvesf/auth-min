"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateTokenUseCase = void 0;
const either_1 = require("../../../../core/either");
const unique_entity_id_1 = require("../../../../core/entities/unique-entity-id");
const invalid_token_error_1 = require("./errors/invalid-token-error");
class ValidateTokenUseCase {
    constructor(userRepository, accessTokenRepository, tokenValidator) {
        this.userRepository = userRepository;
        this.accessTokenRepository = accessTokenRepository;
        this.tokenValidator = tokenValidator;
    }
    async execute(token) {
        const payload = await this.tokenValidator.validate(token);
        if (!payload || payload.type === "refresh") {
            return (0, either_1.left)(new invalid_token_error_1.InvalidTokenError());
        }
        const storedAccessToken = await this.accessTokenRepository.findByToken(token);
        if (!storedAccessToken || storedAccessToken.isExpired()) {
            return (0, either_1.left)(new invalid_token_error_1.InvalidTokenError());
        }
        const user = await this.userRepository.findById(new unique_entity_id_1.UniqueEntityID(payload.sub));
        if (!user) {
            return (0, either_1.left)(new invalid_token_error_1.InvalidTokenError());
        }
        return (0, either_1.right)({
            userId: user.id.toString(),
            email: user.email,
            name: user.name,
        });
    }
}
exports.ValidateTokenUseCase = ValidateTokenUseCase;
