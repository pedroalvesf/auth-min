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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserController = void 0;
const common_1 = require("@nestjs/common");
const create_user_1 = require("../../../../domain/auth/application/use-cases/create-user");
// import { UserAlreadyExistsError } from '@/domain/auth/application/use-cases/errors/user-already-exists-error'
const create_user_dto_1 = require("../dto/create-user-dto");
const user_already_exists_error_1 = require("../../../../domain/auth/application/use-cases/errors/user-already-exists-error");
const authenticate_device_1 = require("../../../../domain/auth/application/use-cases/authenticate-device");
const unique_entity_id_1 = require("../../../../core/entities/unique-entity-id");
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const device_1 = require("../../../../domain/auth/enterprise/entities/device");
let CreateUserController = class CreateUserController {
    constructor(createUser, authenticateDevice) {
        this.createUser = createUser;
        this.authenticateDevice = authenticateDevice;
    }
    async handle(body, headers) {
        const { email, password, name } = body;
        const result = await this.createUser.execute({
            email,
            password,
            name,
        });
        if (result.isLeft()) {
            const error = result.value;
            switch (error.constructor) {
                case user_already_exists_error_1.UserAlreadyExistsError:
                    throw new common_1.ConflictException(error.message);
                default:
                    throw new common_1.BadRequestException(error.message);
            }
        }
        const geo = await geoip_lite_1.default.lookup(headers.get("x-ipaddress") ?? "");
        const location = geo ? `${geo.city}, ${geo.country}` : "unknown";
        const deviceEntity = device_1.Device.create({
            userId: new unique_entity_id_1.UniqueEntityID(result.value.user.id.toString()),
            name: `${headers.get("x-operatingsystem") ?? "Unknown"} - ${headers.get("x-browser") ?? "Unknown"}`,
            type: headers.get("x-type") ?? "Unknown",
            operatingSystem: headers.get("x-operatingsystem") ?? "Unknown",
            ipAddress: headers.get("x-ipaddress") ?? "Unknown",
            browser: headers.get("x-browser") ?? "Unknown",
            location: location,
            lastLogin: new Date(),
            createdAt: new Date(),
            active: true,
        });
        const tokens = await this.authenticateDevice.execute({
            password,
            device: deviceEntity,
        });
        if (tokens.isLeft()) {
            throw new common_1.BadRequestException(tokens.value.message);
        }
        return {
            accessToken: tokens.value.accessToken.token,
            refreshToken: tokens.value.refreshToken.token,
        };
    }
};
exports.CreateUserController = CreateUserController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], CreateUserController.prototype, "handle", null);
exports.CreateUserController = CreateUserController = __decorate([
    (0, common_1.Controller)("auth/user"),
    __metadata("design:paramtypes", [create_user_1.CreateUserUseCase,
        authenticate_device_1.AuthenticateDeviceUseCase])
], CreateUserController);
