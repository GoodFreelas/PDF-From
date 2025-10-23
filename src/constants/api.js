/**
 * Constantes da API
 * @fileoverview Configurações e constantes relacionadas à API
 */

/**
 * URL base da API
 */
export const API_BASE_URL = "https://pdf-from.fly.dev";

/**
 * Configurações de retry para requisições
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY: 2000, // 2 segundos
  BACKOFF_MULTIPLIER: 2
};

/**
 * Timeout para requisições (em milissegundos)
 */
export const REQUEST_TIMEOUT = 10000; // 10 segundos
