/**
 * TTLs centralizados dos tokens de autenticação.
 *
 * Observação: a expiração efetiva do access token (JWT) é definida no
 * Encrypter/JWT. Estes valores controlam a expiração persistida do refresh
 * token e servem de fonte única para evitar números mágicos espalhados.
 *
 * TODO: promover para configuração via env (ver PLANO-CORRECOES.md, Fase 3.2).
 */
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutos
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
