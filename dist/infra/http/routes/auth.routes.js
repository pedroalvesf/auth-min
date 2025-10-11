"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthRoutes = registerAuthRoutes;
const register_controller_1 = require("../controllers/auth/register-controller");
const login_controller_1 = require("../controllers/auth/login-controller");
const validate_controller_1 = require("../controllers/auth/validate-controller");
const make_handler_1 = require("../make-handler");
function registerAuthRoutes(server, deps) {
    const registerController = new register_controller_1.RegisterController(server, deps.registerUserUseCase);
    const loginController = new login_controller_1.LoginController(server, deps.loginUserUseCase);
    const validateController = new validate_controller_1.ValidateController(server, deps.validateTokenUseCase);
    server.addRoute("POST", "/auth/register", (0, make_handler_1.makeHandler)(registerController.handle.bind(registerController)));
    server.addRoute("POST", "/auth/login", (0, make_handler_1.makeHandler)(loginController.handle.bind(loginController)));
    server.addRoute("POST", "/auth/validate", (0, make_handler_1.makeHandler)(validateController.handle.bind(validateController)));
}
