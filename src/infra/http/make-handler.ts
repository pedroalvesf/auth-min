import { IncomingMessage, ServerResponse } from "http";

export interface Handler {
  (req: IncomingMessage, res: ServerResponse): Promise<void>
}

export function makeHandler(handler: Handler) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('Handler error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  };
}