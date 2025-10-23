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
exports.ValidateTokenUseCase = void 0;
const common_1 = require("@nestjs/common");
const either_1 = require("../../../../core/either");
const token_validator_1 = require("../cryptography/token-validator");
const users_repository_1 = require("../repositories/users-repository");
const invalid_token_error_1 = require("./errors/invalid-token-error");
let ValidateTokenUseCase = class ValidateTokenUseCase {
    constructor(userRepository, tokenValidator) {
        this.userRepository = userRepository;
        this.tokenValidator = tokenValidator;
    }
    async execute(token) {
        const payload = await this.tokenValidator.validate(token);
        if (!payload || payload.type === "refresh") {
            return (0, either_1.left)(new invalid_token_error_1.InvalidTokenError());
        }
        // Validação baseada apenas no JWT token sem verificar no banco
        if (!payload.sub) {
            return (0, either_1.left)(new invalid_token_error_1.InvalidTokenError());
        }
        const user = await this.userRepository.findById(payload.sub.toString());
        if (!user) {
            return (0, either_1.left)(new invalid_token_error_1.InvalidTokenError());
        }
        return (0, either_1.right)({
            userId: user.id.toString(),
            email: user.email,
            name: user.name,
        });
    }
};
exports.ValidateTokenUseCase = ValidateTokenUseCase;
exports.ValidateTokenUseCase = ValidateTokenUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        token_validator_1.TokenValidator])
], ValidateTokenUseCase);
