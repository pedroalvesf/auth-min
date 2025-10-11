import { HttpServer } from "../server";
import { HealthController } from "../controllers/health/health-controller";
import { makeHandler } from "../make-handler";

export function registerHealthRoutes(server: HttpServer): void {
  const healthController = new HealthController(server);

  server.addRoute("GET", "/health", makeHandler(healthController.handle.bind(healthController)));
}