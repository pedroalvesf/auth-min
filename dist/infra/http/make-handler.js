"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeHandler = makeHandler;
function makeHandler(handler) {
    return async (req, res) => {
        try {
            await handler(req, res);
        }
        catch (error) {
            console.error('Handler error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    };
}
