/**
 * Sistema de logs centralizado
 */

// Tipos de logs para categorizar los mensajes
enum LogLevel {
  INFO,
  SUCCESS,
  WARNING,
  ERROR,
  DEBUG
}

/**
 * Registra un mensaje informativo
 */
export function logInfo(message: string): void {
  console.log(`ℹ️ ${message}`);
}

/**
 * Registra un mensaje de éxito
 */
export function logSuccess(message: string): void {
  console.log(`✅ ${message}`);
}

/**
 * Registra un mensaje de advertencia
 */
export function logWarning(message: string): void {
  console.log(`⚠️ ${message}`);
}

/**
 * Registra un mensaje de error
 */
export function logError(message: string, error?: Error): void {
  console.log(`❌ ${message}`);
  if (error && error.stack) {
    console.log(`   ${error.stack.split('\n')[0]}`);
  }
}

/**
 * Registra un mensaje de depuración
 */
export function logDebug(message: string): void {
  console.log(`🔍 ${message}`);
}

/**
 * Registra un título de sección
 */
export function logSection(title: string): void {
  console.log(`\n📌 ${title.toUpperCase()}`);
}

/**
 * Trunca y registra un mensaje largo
 */
export function logTruncated(prefix: string, message: string, maxLength: number = 100): void {
  const truncated = message.length > maxLength 
    ? message.substring(0, maxLength) + "..." 
    : message;
  console.log(`${prefix} "${truncated}"`);
}

/**
 * Registra un resumen de códigos
 */
export function logCodeSummary(codigos: Record<string, string>): void {
  console.log('\n📊 RESUMEN DE CÓDIGOS:');
  for (const [siglo, codigo] of Object.entries(codigos)) {
    console.log(`Siglo ${siglo}: ${codigo}`);
  }
}
