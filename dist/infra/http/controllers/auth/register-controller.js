"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterController = void 0;
const errors_1 = require("../../errors");
class RegisterController {
    constructor(server, registerUserUseCase) {
        this.server = server;
        this.registerUserUseCase = registerUserUseCase;
    }
    async handle(req, res) {
        const body = await this.server.parseBody(req);
        if (!body.email || !body.password) {
            return errors_1.HttpErrorHandler.sendBadRequest(res, "Email and password are required");
        }
        const result = await this.registerUserUseCase.execute({
            email: body.email,
            password: body.password,
            name: body.name,
        });
        if (result.isLeft()) {
            return errors_1.HttpErrorHandler.handleDomainError(res, result.value);
        }
        const user = result.value;
        this.server.sendJson(res, {
            user: {
                id: user.id.toString(),
                email: user.email,
                name: user.name,
            },
        }, 201);
    }
}
exports.RegisterController = RegisterController;
