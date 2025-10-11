"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const server_1 = require("./infra/http/server");
const routes_1 = require("./infra/http/routes");
const prisma_user_repository_1 = require("./infra/database/prisma/repositories/prisma-user-repository");
const prisma_session_repository_1 = require("./infra/database/prisma/repositories/prisma-session-repository");
const register_user_1 = require("./domain/auth/application/use-cases/register-user");
const login_user_1 = require("./domain/auth/application/use-cases/login-user");
const validate_token_1 = require("./domain/auth/application/use-cases/validate-token");
async function bootstrap() {
    const prisma = new client_1.PrismaClient();
    const server = new server_1.HttpServer();
    const userRepository = new prisma_user_repository_1.PrismaUserRepository(prisma);
    const sessionRepository = new prisma_session_repository_1.PrismaSessionRepository(prisma);
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET environment variable is required");
    }
    const registerUserUseCase = new register_user_1.RegisterUserUseCase(userRepository);
    const loginUserUseCase = new login_user_1.LoginUserUseCase(userRepository, sessionRepository, jwtSecret);
    const validateTokenUseCase = new validate_token_1.ValidateTokenUseCase(userRepository, jwtSecret);
    (0, routes_1.registerHttpRoutes)(server, {
        registerUserUseCase,
        loginUserUseCase,
        validateTokenUseCase,
    });
    const port = parseInt(process.env.PORT || "3000");
    server.listen(port, () => {
        console.log(`=� Auth service running on port ${port}`);
        console.log(`=� Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    });
    process.on("SIGINT", async () => {
        console.log("Shutting down gracefully...");
        await prisma.$disconnect();
        process.exit(0);
    });
}
bootstrap().catch(console.error);
