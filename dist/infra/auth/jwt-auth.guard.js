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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const passport_1 = require("@nestjs/passport");
const public_1 = require("./public");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(reflector) {
        super();
        this.reflector = reflector;
        this.excludedRoutes = [];
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        if (isPublic) {
            return true;
        }
        // Verificar endpoints públicos especiais
        const publicEndpoints = this.reflector.getAllAndMerge(public_1.PUBLIC_ENDPOINT_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        if (publicEndpoints && publicEndpoints.length) {
            const request = context.switchToHttp().getRequest();
            const { path } = request;
            if (publicEndpoints.some(endpoint => path.startsWith(endpoint))) {
                return true;
            }
        }
        // Verificar se a rota é /metrics para o Prometheus
        const request = context.switchToHttp().getRequest();
        if (request.path === '/metrics') {
            return true;
        }
        // Verificar se a rota atual está na lista de rotas excluídas
        const { url } = request;
        if (this.excludedRoutes.some(route => url.startsWith(route))) {
            return true;
        }
        return super.canActivate(context);
    }
    handleRequest(err, user, info, context) {
        if (err || !user) {
            throw err || new common_1.UnauthorizedException();
        }
        // Check if user has 2FA enabled but hasn't completed 2FA authentication
        if (user.isTwoFactorAuthenticated === false) {
            throw new common_1.UnauthorizedException('Two-factor authentication required');
        }
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], JwtAuthGuard);
