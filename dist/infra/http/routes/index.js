"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHttpRoutes = registerHttpRoutes;
const auth_routes_1 = require("./auth.routes");
const health_routes_1 = require("./health.routes");
function registerHttpRoutes(server, deps) {
    (0, auth_routes_1.registerAuthRoutes)(server, deps);
    (0, health_routes_1.registerHealthRoutes)(server);
}
