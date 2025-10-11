import { IncomingMessage, ServerResponse } from "http";
import { HttpServer } from "../../server";
import { LoginUserUseCase } from "../../../../domain/auth/application/use-cases/login-user";
import { HttpErrorHandler } from "../../errors";

export class LoginController {
  constructor(
    private server: HttpServer,
    private loginUserUseCase: LoginUserUseCase
  ) {}

  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = await this.server.parseBody(req);

    if (!body.email || !body.password) {
      return HttpErrorHandler.sendBadRequest(res, "Email and password are required");
    }

    const clientIP = this.server.getClientIP(req);
    
    const result = await this.loginUserUseCase.execute({
      email: body.email,
      password: body.password,
      ipAddress: clientIP,
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    if (result.isLeft()) {
      return HttpErrorHandler.handleDomainError(res, result.value);
    }

    this.server.sendJson(res, result.value);
  }
}