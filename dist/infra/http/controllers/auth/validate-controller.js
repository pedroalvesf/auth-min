"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateController = void 0;
const errors_1 = require("../../errors");
class ValidateController {
    constructor(server, validateTokenUseCase) {
        this.server = server;
        this.validateTokenUseCase = validateTokenUseCase;
    }
    async handle(req, res) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return errors_1.HttpErrorHandler.sendUnauthorized(res, "Authorization token required");
        }
        const token = authHeader.substring(7);
        const result = await this.validateTokenUseCase.execute(token);
        if (result.isLeft()) {
            return errors_1.HttpErrorHandler.handleDomainError(res, result.value);
        }
        this.server.sendJson(res, { valid: true, user: result.value });
    }
}
exports.ValidateController = ValidateController;
