import { IncomingMessage, ServerResponse } from "http";
import { HttpServer } from "../../server";
import { ValidateTokenUseCase } from "../../../../domain/auth/application/use-cases/validate-token";
import { HttpErrorHandler } from "../../errors";

export class ValidateController {
  constructor(
    private server: HttpServer,
    private validateTokenUseCase: ValidateTokenUseCase
  ) {}

  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpErrorHandler.sendUnauthorized(res, "Authorization token required");
    }

    const token = authHeader.substring(7);
    const result = await this.validateTokenUseCase.execute(token);

    if (result.isLeft()) {
      return HttpErrorHandler.handleDomainError(res, result.value);
    }

    this.server.sendJson(res, { valid: true, user: result.value });
  }
}