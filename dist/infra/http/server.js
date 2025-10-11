"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServer = void 0;
const http_1 = require("http");
const url_1 = require("url");
class HttpServer {
    constructor() {
        this.routes = [];
        this.server = (0, http_1.createServer)(this.handleRequest.bind(this));
    }
    addRoute(method, path, handler) {
        this.routes.push({ method, path, handler });
    }
    async handleRequest(req, res) {
        try {
            this.setCorsHeaders(res);
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }
            const { pathname } = (0, url_1.parse)(req.url || '', true);
            const route = this.findRoute(req.method || '', pathname || '');
            if (!route) {
                this.sendError(res, 404, 'Not Found');
                return;
            }
            await route.handler(req, res);
        }
        catch (error) {
            console.error('Server error:', error);
            this.sendError(res, 500, 'Internal Server Error');
        }
    }
    findRoute(method, path) {
        return this.routes.find(route => route.method === method && route.path === path) || null;
    }
    setCorsHeaders(res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    sendError(res, statusCode, message) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: message }));
    }
    sendJson(res, data, statusCode = 200) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }
    async parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                }
                catch (error) {
                    reject(new Error('Invalid JSON'));
                }
            });
            req.on('error', reject);
        });
    }
    getClientIP(req) {
        const forwarded = req.headers['x-forwarded-for'];
        const realIP = req.headers['x-real-ip'];
        if (forwarded) {
            return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
        }
        if (realIP) {
            return Array.isArray(realIP) ? realIP[0] : realIP;
        }
        return req.socket.remoteAddress || 'unknown';
    }
    listen(port, callback) {
        this.server.listen(port, callback);
    }
}
exports.HttpServer = HttpServer;
