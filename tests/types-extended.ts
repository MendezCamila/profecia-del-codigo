/**
 * Extensiones para tipos nativos
 */

// Extender el tipo Error para incluir el código
declare global {
  interface Error {
    code?: string;
    response?: any;
    request?: any;
  }

  // Variables globales para simulación en pruebas
  var titulosCapturados: Record<string, string> | undefined;
}

export {};
