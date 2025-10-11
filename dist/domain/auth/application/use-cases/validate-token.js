"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateTokenUseCase = void 0;
const either_1 = require("../../../../core/either");
const jwt_1 = require("../../../../infra/security/jwt");
const unique_entity_id_1 = require("../../../../core/entities/unique-entity-id");
const invalid_token_error_1 = require("./errors/invalid-token-error");
class ValidateTokenUseCase {
    constructor(userRepository, jwtSecret) {
        this.userRepository = userRepository;
        this.jwtSecret = jwtSecret;
    }
    async execute(token) {
        const payload = jwt_1.JwtService.verify(token, this.jwtSecret);
        if (!payload || payload.type === 'refresh') {
            return (0, either_1.left)(new invalid_token_error_1.InvalidTokenError());
        }
        const user = await this.userRepository.findById(new unique_entity_id_1.UniqueEntityID(payload.sub));
        if (!user) {
            return (0, either_1.left)(new invalid_token_error_1.InvalidTokenError());
        }
        return (0, either_1.right)({
            userId: user.id.toString(),
            email: user.email,
            name: user.name
        });
    }
}
exports.ValidateTokenUseCase = ValidateTokenUseCase;
