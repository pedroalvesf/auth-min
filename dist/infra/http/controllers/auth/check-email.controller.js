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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckEmailController = void 0;
const check_email_1 = require("@/domain/auth/application/use-cases/check-email");
const common_1 = require("@nestjs/common");
const check_email_dto_1 = require("../dto/check-email-dto");
const public_1 = require("../../../auth/public");
let CheckEmailController = class CheckEmailController {
    constructor(checkEmailUseCase) {
        this.checkEmailUseCase = checkEmailUseCase;
    }
    async handle(query) {
        const result = await this.checkEmailUseCase.execute({ email: query.email });
        return {
            taken: result.value?.user ? true : false,
            message: result.value?.user !== null ? 'E-mail já cadastrado.' : 'E-mail não encontrado.'
        };
    }
};
exports.CheckEmailController = CheckEmailController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof check_email_dto_1.CheckEmailDto !== "undefined" && check_email_dto_1.CheckEmailDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], CheckEmailController.prototype, "handle", null);
exports.CheckEmailController = CheckEmailController = __decorate([
    (0, common_1.Controller)('register/check-email'),
    (0, public_1.Public)(),
    __metadata("design:paramtypes", [typeof (_a = typeof check_email_1.CheckEmailUseCase !== "undefined" && check_email_1.CheckEmailUseCase) === "function" ? _a : Object])
], CheckEmailController);
