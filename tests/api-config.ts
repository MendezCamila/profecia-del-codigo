/**
 * Configuración de conexión a la API de Manuscritos Arcanos
 * Este archivo centraliza la configuración para conectarse a la API de desafíos
 */

// URL base de la API - URL real proporcionada en la prueba técnica
export const API_BASE_URL = process.env.API_URL || 'https://backend-production-9d875.up.railway.app';

// Endpoints específicos
export const API_ENDPOINTS = {
  desafio: '/api/cipher/challenge',
  verificacion: '/api/cipher/verify',
  manuscritos: '/api/manuscripts'
};

// Configuración de tiempos de espera
export const API_TIMEOUTS = {
  conexion: 10000,  // 10 segundos
  respuesta: 30000   // 30 segundos
};

// Credenciales (deberían obtenerse de variables de entorno en producción)
export const API_CREDENTIALS = {
  apiKey: process.env.API_KEY || 'test-api-key',
  token: process.env.API_TOKEN || 'test-token'
};

// Encabezados comunes para todas las peticiones
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'ProfeciaCodigo-Test/1.0',
  'Authorization': `Bearer ${API_CREDENTIALS.token}`
};

// Opciones de reintentos
export const API_RETRY = {
  maxRetries: 3,
  delayBetweenRetries: 1000 // 1 segundo
};
