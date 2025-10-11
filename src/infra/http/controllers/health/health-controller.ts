import { IncomingMessage, ServerResponse } from "http";
import { HttpServer } from "../../server";

export class HealthController {
  constructor(private server: HttpServer) {}

  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    this.server.sendJson(res, {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "auth-min",
    });
  }
}