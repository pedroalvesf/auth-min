"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string().min(32, "JWT_SECRET must have at least 32 characters"),
    PORT: zod_1.z.number(),
    SECRET_ENCRYPTION_KEY: zod_1.z.string().optional(),
});
