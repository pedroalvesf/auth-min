import { HttpServer } from "../server";
import { registerAuthRoutes } from "./auth.routes";
import { registerHealthRoutes } from "./health.routes";

export interface Dependencies {
  registerUserUseCase: any;
  loginUserUseCase: any;
  validateTokenUseCase: any;
}

export function registerHttpRoutes(server: HttpServer, deps: Dependencies): void {
  registerAuthRoutes(server, deps);
  registerHealthRoutes(server);
}