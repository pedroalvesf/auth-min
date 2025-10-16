import "dotenv/config";
import { setupContainer } from "./infra/container/container-setup";
import { 
  getAuthenticateDeviceUseCase, 
  getValidateTokenUseCase, 
  getRefreshAccessTokenUseCase,
  getRegisterUserUseCase 
} from "./core/container/use-case-factory";
import { HttpServer } from "./infra/http/server";
import { registerHttpRoutes } from "./infra/http/routes";

async function bootstrap() {
  // Inicializar container IoC
  setupContainer();
  
  const server = new HttpServer();

  // Resolver casos de uso via DI
  const authenticateDeviceUseCase = getAuthenticateDeviceUseCase();
  const validateTokenUseCase = getValidateTokenUseCase();
  const refreshAccessTokenUseCase = getRefreshAccessTokenUseCase();
  const registerUserUseCase = getRegisterUserUseCase();

  registerHttpRoutes(server, {
    authenticateDeviceUseCase,
    validateTokenUseCase,
    refreshAccessTokenUseCase,
    registerUserUseCase,
  });

  const port = parseInt(process.env.PORT || "3000");

  server.listen(port, () => {
    console.log(`🚀 Auth service running on port ${port}`);
    console.log(`📦 Container IoC configurado`);
    console.log(
      `💾 Memory usage: ${Math.round(
        process.memoryUsage().heapUsed / 1024 / 1024
      )}MB`
    );
  });

  process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    // TODO: Desconectar Prisma via container se necessário
    process.exit(0);
  });
}

bootstrap().catch(console.error);
