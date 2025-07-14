/**
 * Configuración centralizada para la automatización de pruebas
 */

// URLs de la aplicación
export const APP_URLS = {
  LOGIN: 'https://pruebatecnica-sherpa-production.up.railway.app/login',
  PORTAL: 'https://pruebatecnica-sherpa-production.up.railway.app/portal',
  API_CHALLENGE: 'https://backend-production-9d875.up.railway.app/api/cipher/challenge'
};

// Credenciales de acceso
export const CREDENTIALS = {
  EMAIL: 'monje@sherpa.local',
  PASSWORD: 'cript@123'
};

// Tiempos de espera (en ms)
export const TIMEOUTS = {
  PAGE_LOAD: 30000,
  NAVIGATION: 45000,
  DIALOG: 10000,
  ELEMENT_VISIBLE: 10000,
  DOWNLOAD: 15000,
  MODAL_TRANSITION: 2000,
  SHORT_PAUSE: 500,
  MEDIUM_PAUSE: 1000,
  LONG_PAUSE: 3000
};

// Límites para operaciones de archivo
export const FILE_LIMITS = {
  PDF_CONTENT_MAX: 30000,
  PDF_SEARCH_LIMIT: 20000,
  MAX_ATTEMPTS: 5,
  MAX_NAV_ATTEMPTS: 3
};

// Códigos de respaldo organizados por siglo
export const BACKUP_CODES = {
  'XIV': 'AUREUS1350',
  'XV': 'DIAZEPAM850',
  'XVI': 'SERAPH1520',
  'XVII': 'NECRONOMICON1317',
  'XVIII': 'MALLEUS1692'
};

// Valores predeterminados y códigos especiales
export const DEFAULT_VALUES = {
  CODE_NOT_FOUND: 'CODIGO_NO_ENCONTRADO',
  DEFAULT_CODE: 'CODIGO123',
  FALLBACK_CODE_XVII: 'VS675Q'
};

// Rutas de archivos
export const PATHS = {
  DOWNLOADS_DIR: 'downloads',
  CODE_HISTORY_FILE: 'code-history.json'
};
