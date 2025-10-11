"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHealthRoutes = registerHealthRoutes;
const health_controller_1 = require("../controllers/health/health-controller");
const make_handler_1 = require("../make-handler");
function registerHealthRoutes(server) {
    const healthController = new health_controller_1.HealthController(server);
    server.addRoute("GET", "/health", (0, make_handler_1.makeHandler)(healthController.handle.bind(healthController)));
}
