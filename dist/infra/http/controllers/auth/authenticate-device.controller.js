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
exports.AuthenticateDeviceController = void 0;
const unique_entity_id_1 = require("../../../../core/entities/unique-entity-id");
const authenticate_device_1 = require("../../../../domain/auth/application/use-cases/authenticate-device");
const wrong_credentials_error_1 = require("../../../../domain/auth/application/use-cases/errors/wrong-credentials-error");
const common_1 = require("@nestjs/common");
const authenticate_device_dto_1 = require("../dto/authenticate-device-dto");
const device_1 = require("../../../../domain/auth/enterprise/entities/device");
const public_1 = require("../../../auth/public");
const users_repository_1 = require("../../../../domain/auth/application/repositories/users-repository");
const geoip_lite_1 = __importDefault(require("geoip-lite"));
let AuthenticateDeviceController = class AuthenticateDeviceController {
    constructor(authenticateDeviceUseCase, usersRepository) {
        this.authenticateDeviceUseCase = authenticateDeviceUseCase;
        this.usersRepository = usersRepository;
    }
    async handle(body, headers) {
        const user = await this.usersRepository.findByEmail(body.email);
        if (!user) {
            throw new common_1.HttpException("Credenciais inválidas", common_1.HttpStatus.UNAUTHORIZED);
        }
        const ipAddress = headers.get("x-ipaddress") ?? "";
        const operatingSystem = headers.get("x-operatingsystem") ?? "Unknown";
        const browser = headers.get("x-browser") ?? "Unknown";
        const deviceType = headers.get("x-type") ?? "Unknown";
        if (!ipAddress || !operatingSystem || !browser || !deviceType) {
            throw new common_1.HttpException("Headers obrigatórios ausentes: x-ipaddress, x-operatingsystem, x-browser, x-type", common_1.HttpStatus.BAD_REQUEST);
        }
        const geo = geoip_lite_1.default.lookup(ipAddress);
        const location = geo ? `${geo.city}, ${geo.country}` : "unknown";
        const device = device_1.Device.create({
            userId: new unique_entity_id_1.UniqueEntityID(user.id.toString()),
            name: `${operatingSystem} - ${browser}`,
            type: deviceType,
            operatingSystem,
            ipAddress,
            browser,
            location,
            lastLogin: new Date(),
            createdAt: new Date(),
            active: true,
        });
        const result = await this.authenticateDeviceUseCase.execute({
            password: body.password,
            device,
        });
        if (result.isLeft()) {
            const error = result.value;
            switch (error.constructor) {
                case wrong_credentials_error_1.WrongCredentialsError:
                    throw new common_1.HttpException("Credenciais inválidas", common_1.HttpStatus.UNAUTHORIZED);
                default:
                    throw new common_1.HttpException("Erro interno do servidor", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        const { accessToken, refreshToken } = result.value;
        return {
            accessToken: accessToken.token,
            refreshToken: refreshToken.token,
        };
    }
};
exports.AuthenticateDeviceController = AuthenticateDeviceController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authenticate_device_dto_1.AuthenticateDeviceDto, Object]),
    __metadata("design:returntype", Promise)
], AuthenticateDeviceController.prototype, "handle", null);
exports.AuthenticateDeviceController = AuthenticateDeviceController = __decorate([
    (0, common_1.Controller)("/login"),
    (0, public_1.Public)(),
    __metadata("design:paramtypes", [authenticate_device_1.AuthenticateDeviceUseCase,
        users_repository_1.UsersRepository])
], AuthenticateDeviceController);
