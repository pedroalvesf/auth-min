import { createServer, IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url'

export interface RouteHandler {
  (req: IncomingMessage, res: ServerResponse, params?: Record<string, string>): Promise<void>
}

export interface Route {
  method: string
  path: string
  handler: RouteHandler
}

export class HttpServer {
  private routes: Route[] = []
  private server = createServer(this.handleRequest.bind(this))

  addRoute(method: string, path: string, handler: RouteHandler): void {
    this.routes.push({ method, path, handler })
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      this.setCorsHeaders(res)

      if (req.method === 'OPTIONS') {
        res.writeHead(200)
        res.end()
        return
      }

      const { pathname } = parse(req.url || '', true)
      const route = this.findRoute(req.method || '', pathname || '')

      if (!route) {
        this.sendError(res, 404, 'Not Found')
        return
      }

      await route.handler(req, res)
    } catch (error) {
      console.error('Server error:', error)
      this.sendError(res, 500, 'Internal Server Error')
    }
  }

  private findRoute(method: string, path: string): Route | null {
    return this.routes.find(route => 
      route.method === method && route.path === path
    ) || null
  }

  private setCorsHeaders(res: ServerResponse): void {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  private sendError(res: ServerResponse, statusCode: number, message: string): void {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: message }))
  }

  sendJson(res: ServerResponse, data: any, statusCode = 200): void {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  }

  async parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = ''
      req.on('data', chunk => body += chunk.toString())
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {})
        } catch (error) {
          reject(new Error('Invalid JSON'))
        }
      })
      req.on('error', reject)
    })
  }

  getClientIP(req: IncomingMessage): string {
    const forwarded = req.headers['x-forwarded-for']
    const realIP = req.headers['x-real-ip']
    
    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return Array.isArray(realIP) ? realIP[0] : realIP
    }
    
    return req.socket.remoteAddress || 'unknown'
  }

  listen(port: number, callback?: () => void): void {
    this.server.listen(port, callback)
  }
}