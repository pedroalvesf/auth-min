"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserUseCase = void 0;
const either_1 = require("../../../../core/either");
const user_1 = require("../../../auth/enterprise/entities/user");
const user_already_exists_error_1 = require("./errors/user-already-exists-error");
class RegisterUserUseCase {
    constructor(userRepository, hashGenerator) {
        this.userRepository = userRepository;
        this.hashGenerator = hashGenerator;
    }
    async execute(dto) {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            return (0, either_1.left)(new user_already_exists_error_1.UserAlreadyExistsError());
        }
        const hashedPassword = await this.hashGenerator.hash(dto.password);
        const user = user_1.User.create({
            email: dto.email,
            password: hashedPassword,
            name: dto.name,
        });
        await this.userRepository.save(user);
        return (0, either_1.right)(user);
    }
}
exports.RegisterUserUseCase = RegisterUserUseCase;
