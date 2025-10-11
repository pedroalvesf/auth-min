"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginController = void 0;
const errors_1 = require("../../errors");
class LoginController {
    constructor(server, loginUserUseCase) {
        this.server = server;
        this.loginUserUseCase = loginUserUseCase;
    }
    async handle(req, res) {
        const body = await this.server.parseBody(req);
        if (!body.email || !body.password) {
            return errors_1.HttpErrorHandler.sendBadRequest(res, "Email and password are required");
        }
        const clientIP = this.server.getClientIP(req);
        const result = await this.loginUserUseCase.execute({
            email: body.email,
            password: body.password,
            ipAddress: clientIP,
            userAgent: req.headers['user-agent'] || 'unknown'
        });
        if (result.isLeft()) {
            return errors_1.HttpErrorHandler.handleDomainError(res, result.value);
        }
        this.server.sendJson(res, result.value);
    }
}
exports.LoginController = LoginController;
