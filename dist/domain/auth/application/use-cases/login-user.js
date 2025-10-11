"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserUseCase = void 0;
const either_1 = require("../../../../core/either");
const session_1 = require("../../../auth/enterprise/entities/session");
const password_1 = require("../../../../infra/security/password");
const jwt_1 = require("../../../../infra/security/jwt");
const invalid_credentials_error_1 = require("./errors/invalid-credentials-error");
class LoginUserUseCase {
    constructor(userRepository, sessionRepository, jwtSecret) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.jwtSecret = jwtSecret;
    }
    async execute(dto) {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            return (0, either_1.left)(new invalid_credentials_error_1.InvalidCredentialsError());
        }
        const isPasswordValid = await password_1.PasswordService.verify(dto.password, user.password);
        if (!isPasswordValid) {
            return (0, either_1.left)(new invalid_credentials_error_1.InvalidCredentialsError());
        }
        const accessToken = jwt_1.JwtService.sign({ sub: user.id.toString(), email: user.email }, this.jwtSecret, 900 // 15 minutes
        );
        const refreshToken = jwt_1.JwtService.sign({ sub: user.id.toString(), type: "refresh" }, this.jwtSecret, 604800 // 7 days
        );
        const session = session_1.Session.create({
            userId: user.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 604800 * 1000),
        });
        await this.sessionRepository.save(session);
        return (0, either_1.right)({
            accessToken,
            refreshToken,
            user: {
                id: user.id.toString(),
                email: user.email,
                name: user.name,
            },
        });
    }
}
exports.LoginUserUseCase = LoginUserUseCase;
