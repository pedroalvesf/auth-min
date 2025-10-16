import { IncomingMessage, ServerResponse } from "http";
import { HttpServer } from "../../server";
import { RegisterUserUseCase } from "../../../../domain/auth/application/use-cases/create-user";
import { HttpErrorHandler } from "../../errors";

export class RegisterController {
  constructor(
    private server: HttpServer,
    private registerUserUseCase: RegisterUserUseCase
  ) {}

  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = await this.server.parseBody(req);

    if (!body.email || !body.password) {
      return HttpErrorHandler.sendBadRequest(
        res,
        "Email and password are required"
      );
    }

    const result = await this.registerUserUseCase.execute({
      email: body.email,
      password: body.password,
      name: body.name,
    });

    if (result.isLeft()) {
      return HttpErrorHandler.handleDomainError(res, result.value);
    }

    const user = result.value;
    this.server.sendJson(
      res,
      {
        user: {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        },
      },
      201
    );
  }
}
