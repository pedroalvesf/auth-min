"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string(),
    PORT: zod_1.z.number(),
    SECRET_ENCRYPTION_KEY: zod_1.z.string(),
    JWT_PRIVATE_KEY: zod_1.z.string(),
    JWT_PUBLIC_KEY: zod_1.z.string(),
});
