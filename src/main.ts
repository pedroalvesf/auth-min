import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { HttpServer } from "./infra/http/server";
import { registerHttpRoutes } from "./infra/http/routes";
import { PrismaUserRepository } from "./infra/database/prisma/repositories/prisma-user-repository";
import { PrismaSessionRepository } from "./infra/database/prisma/repositories/prisma-session-repository";
import { RegisterUserUseCase } from "./domain/auth/application/use-cases/register-user";
import { LoginUserUseCase } from "./domain/auth/application/use-cases/login-user";
import { ValidateTokenUseCase } from "./domain/auth/application/use-cases/validate-token";

async function bootstrap() {
  const prisma = new PrismaClient();
  const server = new HttpServer();

  const userRepository = new PrismaUserRepository(prisma);
  const sessionRepository = new PrismaSessionRepository(prisma);

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  const registerUserUseCase = new RegisterUserUseCase(userRepository);
  const loginUserUseCase = new LoginUserUseCase(
    userRepository,
    sessionRepository,
    jwtSecret
  );
  const validateTokenUseCase = new ValidateTokenUseCase(
    userRepository,
    jwtSecret
  );

  registerHttpRoutes(server, {
    registerUserUseCase,
    loginUserUseCase,
    validateTokenUseCase,
  });

  const port = parseInt(process.env.PORT || "3000");

  server.listen(port, () => {
    console.log(`=� Auth service running on port ${port}`);
    console.log(
      `=� Memory usage: ${Math.round(
        process.memoryUsage().heapUsed / 1024 / 1024
      )}MB`
    );
  });

  process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
  });
}

bootstrap().catch(console.error);
