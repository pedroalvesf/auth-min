"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
class HealthController {
    constructor(server) {
        this.server = server;
    }
    async handle(req, res) {
        this.server.sendJson(res, {
            status: "ok",
            timestamp: new Date().toISOString(),
            service: "auth-min",
        });
    }
}
exports.HealthController = HealthController;
