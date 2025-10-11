import { HttpServer } from "../server";
import { RegisterController } from "../controllers/auth/register-controller";
import { LoginController } from "../controllers/auth/login-controller";
import { ValidateController } from "../controllers/auth/validate-controller";
import { makeHandler } from "../make-handler";

interface AuthDependencies {
  registerUserUseCase: any;
  loginUserUseCase: any;
  validateTokenUseCase: any;
}

export function registerAuthRoutes(server: HttpServer, deps: AuthDependencies): void {
  const registerController = new RegisterController(server, deps.registerUserUseCase);
  const loginController = new LoginController(server, deps.loginUserUseCase);
  const validateController = new ValidateController(server, deps.validateTokenUseCase);

  server.addRoute("POST", "/auth/register", makeHandler(registerController.handle.bind(registerController)));
  server.addRoute("POST", "/auth/login", makeHandler(loginController.handle.bind(loginController)));
  server.addRoute("POST", "/auth/validate", makeHandler(validateController.handle.bind(validateController)));
}