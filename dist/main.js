"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const container_setup_1 = require("./infra/container/container-setup");
const use_case_factory_1 = require("./core/container/use-case-factory");
const server_1 = require("./infra/http/server");
const routes_1 = require("./infra/http/routes");
async function bootstrap() {
    // Inicializar container IoC
    (0, container_setup_1.setupContainer)();
    const server = new server_1.HttpServer();
    // Resolver casos de uso via DI
    const authenticateDeviceUseCase = (0, use_case_factory_1.getAuthenticateDeviceUseCase)();
    const validateTokenUseCase = (0, use_case_factory_1.getValidateTokenUseCase)();
    const refreshAccessTokenUseCase = (0, use_case_factory_1.getRefreshAccessTokenUseCase)();
    const registerUserUseCase = (0, use_case_factory_1.getRegisterUserUseCase)();
    (0, routes_1.registerHttpRoutes)(server, {
        authenticateDeviceUseCase,
        validateTokenUseCase,
        refreshAccessTokenUseCase,
        registerUserUseCase,
    });
    const port = parseInt(process.env.PORT || "3000");
    server.listen(port, () => {
        console.log(`🚀 Auth service running on port ${port}`);
        console.log(`📦 Container IoC configurado`);
        console.log(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    });
    process.on("SIGINT", async () => {
        console.log("Shutting down gracefully...");
        // TODO: Desconectar Prisma via container se necessário
        process.exit(0);
    });
}
bootstrap().catch(console.error);
