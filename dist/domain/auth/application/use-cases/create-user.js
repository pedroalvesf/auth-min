"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserUseCase = void 0;
const either_1 = require("../../../../core/either");
const user_1 = require("../../enterprise/entities/user");
const user_already_exists_error_1 = require("./errors/user-already-exists-error");
const unique_entity_id_1 = require("@/core/entities/unique-entity-id");
class CreateUserUseCase {
    constructor(userRepository, hashGenerator) {
        this.userRepository = userRepository;
        this.hashGenerator = hashGenerator;
    }
    async execute({ email, password, name, }) {
        const userExists = await this.userRepository.findByEmail(email);
        if (userExists) {
            return (0, either_1.left)(new user_already_exists_error_1.UserAlreadyExistsError());
        }
        const hashedPassword = await this.hashGenerator.hash(password);
        const user = user_1.User.create({
            email,
            password: hashedPassword,
            name,
        }, new unique_entity_id_1.UniqueEntityID(email));
        await this.userRepository.save(user);
        return (0, either_1.right)({ user });
    }
}
exports.CreateUserUseCase = CreateUserUseCase;
