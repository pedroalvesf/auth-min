import { IncomingMessage, ServerResponse } from "http";
import { LoginHistoryRepository } from "../../../domain/repositories/login-history-repository";
import { HttpServer } from "../server";

export interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockDurationMinutes: number;
}

export class RateLimitMiddleware {
  constructor(
    private loginHistoryRepository: LoginHistoryRepository,
    private server: HttpServer,
    private config: RateLimitConfig
  ) {}

  async handle(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const clientIP = this.server.getClientIP(req);
    
    // Buscar tentativas falhadas recentes deste IP
    const recentFailedAttempts = await this.loginHistoryRepository.findRecentFailedAttempts(
      clientIP,
      this.config.windowMinutes
    );

    // Se excedeu o limite
    if (recentFailedAttempts.length >= this.config.maxAttempts) {
      const lastAttempt = recentFailedAttempts[0];
      const timeSinceLastAttempt = Date.now() - lastAttempt.createdAt.getTime();
      const blockDurationMs = this.config.blockDurationMinutes * 60 * 1000;
      
      // Se ainda está dentro do período de bloqueio
      if (timeSinceLastAttempt < blockDurationMs) {
        const timeRemaining = blockDurationMs - timeSinceLastAttempt;
        const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000));
        
        res.writeHead(429, { 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(timeRemaining / 1000).toString()
        });
        res.end(JSON.stringify({ 
          error: `Too many failed attempts. Try again in ${minutesRemaining} minutes.`,
          retryAfter: Math.ceil(timeRemaining / 1000)
        }));
        
        return false; // Bloqueado
      }
    }

    return true; // Permitido
  }
}