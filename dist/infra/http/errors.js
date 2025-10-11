"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpErrorHandler = void 0;
class HttpErrorHandler {
    static sendBadRequest(res, message = "Bad Request") {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: message }));
    }
    static sendUnauthorized(res, message = "Unauthorized") {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: message }));
    }
    static sendConflict(res, message = "Conflict") {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: message }));
    }
    static sendInternalError(res, message = "Internal Server Error") {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: message }));
    }
    static handleDomainError(res, error) {
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
exports.HttpErrorHandler = HttpErrorHandler;
