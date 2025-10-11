import { ServerResponse } from "http";

export class HttpErrorHandler {
  static sendBadRequest(res: ServerResponse, message: string = "Bad Request") {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }

  static sendUnauthorized(res: ServerResponse, message: string = "Unauthorized") {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }

  static sendConflict(res: ServerResponse, message: string = "Conflict") {
    res.writeHead(409, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }

  static sendInternalError(res: ServerResponse, message: string = "Internal Server Error") {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }

  static handleDomainError(res: ServerResponse, error: Error) {
    switch (error.constructor.name) {
      case 'UserAlreadyExistsError':
        this.sendConflict(res, error.message);
        break;
      case 'InvalidCredentialsError':
        this.sendUnauthorized(res, error.message);
        break;
      case 'InvalidTokenError':
        this.sendUnauthorized(res, error.message);
        break;
      default:
        this.sendInternalError(res, error.message);
    }
  }
}