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
exports.CreateUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const either_1 = require("../../../../core/either");
const user_1 = require("../../enterprise/entities/user");
const users_repository_1 = require("../repositories/users-repository");
const hash_generator_1 = require("../cryptography/hash-generator");
const user_already_exists_error_1 = require("./errors/user-already-exists-error");
const unique_entity_id_1 = require("../../../../core/entities/unique-entity-id");
let CreateUserUseCase = class CreateUserUseCase {
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
};
exports.CreateUserUseCase = CreateUserUseCase;
exports.CreateUserUseCase = CreateUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        hash_generator_1.HashGenerator])
], CreateUserUseCase);
