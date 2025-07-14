/**
 * Constantes compartidas para la automatización de pruebas
 */

// Patrones de expresiones regulares para extraer códigos
export const REGEX_PATTERNS = {
  // Patrones alfanuméricos generales
  ALFANUMERIC_CODE: /\b([A-Z]{5,}\d{3,})\b/i,
  ANY_ALFANUMERIC: /\b([A-Z0-9]{5,})\b/,
  
  // Patrones específicos por manuscrito
  NECRONOMICON: /\b(NECRONOMICON\d{4})\b/i,
  NECRO_SHORT: /\b(NECRO\d{4})\b/i,
  MALLEUS: /\b(MALLEUS\d{4})\b/i,
  AUREUS: /\b(AUREUS\d{4})\b/i,
  DIAZEPAM: /\b(DIAZEPAM\d{3})\b/i,
  SERAPH: /\b(SERAPH\d{4})\b/i,
  
  // Patrones de formato
  NUMERIC_7_DIGITS: /\b(\d{7})\b/,
  CODE_LABEL_NUMERIC: /código[:\s]+(\d{7})/i,
  CODE_LABEL_ALFANUM: /code[:\s]+([A-Z0-9]{4,})/i,
  PASSWORD_LABEL: /password[:\s]+([A-Z0-9]{4,})/i,
  CLAVE_LABEL: /clave[:\s]+([A-Z0-9]{4,})/i
};

// Selectores DOM comunes
export const DOM_SELECTORS = {
  MODAL: 'div[role="dialog"]',
  POPUP: '.modal, .popup, .dialog',
  FIXED_OVERLAY: 'div.fixed, div.fixed.inset-0',
  CLOSE_BUTTON: 'button.close, button[aria-label="Close"], svg.close-icon, .btn-close',
  TOP_RIGHT_CLOSE: '.absolute.top-0.right-0, .absolute.right-0.top-0, .top-right',
  MANUSCRITO_CARD: 'div.group',
  DOWNLOAD_BUTTON: 'button:has-text("Descargar PDF")',
  UNLOCK_BUTTON: 'button:has-text("Desbloquear")',
  DOCUMENTATION_BUTTON: 'button:has-text("Ver Documentación")',
  ACCEPT_BUTTON: 'button:has-text("Aceptar"), button:has-text("OK"), button:has-text("Continuar"), button:has-text("Cerrar")'
};

// Mensajes simulados para los guardianes
export const GUARDIAN_MESSAGES = {
  'XVII': 'Soy el guardián del Necronomicón. Para desbloquear este manuscrito, necesitas resolver un desafío. Usa el código NECROS666 para obtener más información.',
  'XVIII': 'Soy el guardián del Manuscrito Voynich. Para desbloquear este manuscrito, necesitas resolver un desafío. Usa el código VOYNICH123 para obtener más información.'
};

// Títulos de manuscritos
export const MANUSCRIPT_TITLES = {
  'XVII': 'Necronomicon',
  'XVIII': 'Malleus Maleficarum',
  'VOYNICH': 'Manuscrito Voynich'
};
