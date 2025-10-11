"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    constructor(server, registerUserUseCase, loginUserUseCase, validateTokenUseCase) {
        this.server = server;
        this.registerUserUseCase = registerUserUseCase;
        this.loginUserUseCase = loginUserUseCase;
        this.validateTokenUseCase = validateTokenUseCase;
    }
    setupRoutes() {
        this.server.addRoute('POST', '/auth/register', this.register.bind(this));
        this.server.addRoute('POST', '/auth/login', this.login.bind(this));
        this.server.addRoute('POST', '/auth/validate', this.validate.bind(this));
        this.server.addRoute('GET', '/health', this.health.bind(this));
    }
    async register(req, res) {
        try {
            const body = await this.server.parseBody(req);
            if (!body.email || !body.password) {
                this.server.sendJson(res, { error: 'Email and password are required' }, 400);
                return;
            }
            const result = await this.registerUserUseCase.execute({
                email: body.email,
                password: body.password,
                name: body.name
            });
            if (result.isLeft()) {
                this.server.sendJson(res, { error: result.value.message }, 409);
                return;
            }
            const user = result.value;
            this.server.sendJson(res, {
                user: {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.name
                }
            }, 201);
        }
        catch (error) {
            console.error('Register error:', error);
            this.server.sendJson(res, { error: 'Internal server error' }, 500);
        }
    }
    async login(req, res) {
        try {
            const body = await this.server.parseBody(req);
            if (!body.email || !body.password) {
                this.server.sendJson(res, { error: 'Email and password are required' }, 400);
                return;
            }
            const result = await this.loginUserUseCase.execute({
                email: body.email,
                password: body.password
            });
            if (result.isLeft()) {
                this.server.sendJson(res, { error: result.value.message }, 401);
                return;
            }
            this.server.sendJson(res, result.value);
        }
        catch (error) {
            console.error('Login error:', error);
            this.server.sendJson(res, { error: 'Internal server error' }, 500);
        }
    }
    async validate(req, res) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.server.sendJson(res, { error: 'Authorization token required' }, 401);
                return;
            }
            const token = authHeader.substring(7);
            const result = await this.validateTokenUseCase.execute(token);
            if (result.isLeft()) {
                this.server.sendJson(res, { error: result.value.message }, 401);
                return;
            }
            this.server.sendJson(res, { valid: true, user: result.value });
        }
        catch (error) {
            console.error('Validate error:', error);
            this.server.sendJson(res, { error: 'Internal server error' }, 500);
        }
    }
    async health(req, res) {
        this.server.sendJson(res, {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'auth-min'
        });
    }
}
exports.AuthController = AuthController;
