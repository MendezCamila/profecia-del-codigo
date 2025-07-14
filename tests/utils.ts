/**
 * Utilidades para la automatización de pruebas
 */

import fs from 'fs';
import path from 'path';
import { Locator, Page } from '@playwright/test';
import { REGEX_PATTERNS, DOM_SELECTORS } from './constants';
import { TIMEOUTS, BACKUP_CODES, DEFAULT_VALUES } from './config';

/**
 * Maneja rutas de archivos para descargas de PDFs
 */
export function getPdfPath(siglo: string, basePath: string): string {
  const downloadsDir = path.join(basePath, 'downloads');
  
  // Crear directorio si no existe
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }
  
  return path.join(downloadsDir, `siglo-${siglo}.pdf`);
}

/**
 * Extrae código de un texto usando varios patrones
 */
export function extractCodeFromText(text: string, siglo: string): string | null {
  // Normalizar texto
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  
  // Determinar qué patrones usar según el siglo
  const patterns = getPatternsBySiglo(siglo);
  
  // Probar cada patrón
  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      console.log(`✅ Código encontrado en texto: ${match[1]}`);
      return match[1].trim().toUpperCase();
    }
  }
  
  console.log('❌ No se encontró ningún código en el texto');
  return null;
}

/**
 * Devuelve patrones de expresión regular adecuados para cada siglo
 */
function getPatternsBySiglo(siglo: string): RegExp[] {
  // Patrones comunes para todos los siglos
  const commonPatterns = [
    REGEX_PATTERNS.ALFANUMERIC_CODE,
    REGEX_PATTERNS.ANY_ALFANUMERIC,
    REGEX_PATTERNS.CODE_LABEL_ALFANUM,
    REGEX_PATTERNS.PASSWORD_LABEL,
    REGEX_PATTERNS.CLAVE_LABEL
  ];
  
  // Añadir patrones específicos según el siglo
  switch (siglo) {
    case 'XVII':
      return [REGEX_PATTERNS.NECRONOMICON, REGEX_PATTERNS.NECRO_SHORT, ...commonPatterns];
    case 'XVIII':
      return [REGEX_PATTERNS.MALLEUS, ...commonPatterns];
    case 'XIV':
      return [REGEX_PATTERNS.AUREUS, ...commonPatterns];
    case 'XV':
      return [REGEX_PATTERNS.DIAZEPAM, ...commonPatterns];
    case 'XVI':
      return [REGEX_PATTERNS.SERAPH, ...commonPatterns];
    default:
      return commonPatterns;
  }
}

/**
 * Cierra un modal usando diferentes estrategias
 */
export async function closeModal(page: Page, modal: Locator): Promise<boolean> {
  try {
    // 1. Intentar con botón de cierre específico
    const closeButton = modal.locator(DOM_SELECTORS.CLOSE_BUTTON).first();
    if (await closeButton.count() > 0) {
      console.log('✅ Botón para cerrar modal encontrado');
      await closeButton.click();
      await page.waitForTimeout(TIMEOUTS.SHORT_PAUSE);
      return true;
    }
    
    // 2. Intentar con X en esquina superior
    const topRightButton = modal.locator(DOM_SELECTORS.TOP_RIGHT_CLOSE).first();
    if (await topRightButton.count() > 0) {
      console.log('✅ Botón X en esquina superior encontrado');
      await topRightButton.click();
      await page.waitForTimeout(TIMEOUTS.SHORT_PAUSE);
      return true;
    }
    
    // 3. Intentar con cualquier botón
    const anyButton = modal.locator('button').first();
    if (await anyButton.count() > 0) {
      console.log('✅ Encontrado algún botón en el modal');
      await anyButton.click();
      await page.waitForTimeout(TIMEOUTS.SHORT_PAUSE);
      return true;
    }
    
    // 4. Último recurso: tecla Escape
    console.log('⚠️ No se encontró botón, usando tecla Escape');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(TIMEOUTS.SHORT_PAUSE);
    
    // Verificar si el modal sigue visible
    return !(await modal.isVisible());
  } catch (error: any) {
    console.log(`❌ Error al cerrar modal: ${error?.message || 'Error desconocido'}`);
    return false;
  }
}

/**
 * Obtiene código de respaldo según el siglo
 */
export function getBackupCode(siglo: string): string {
  if (BACKUP_CODES[siglo]) {
    console.log(`⚠️ Usando código de respaldo para siglo ${siglo}: ${BACKUP_CODES[siglo]}`);
    return BACKUP_CODES[siglo];
  }
  
  console.log(`⚠️ No se encontró código de respaldo para el siglo ${siglo}, usando código genérico`);
  return DEFAULT_VALUES.DEFAULT_CODE;
}

/**
 * Trunca un mensaje largo para log
 */
export function truncateMessage(message: string, maxLength: number = 100): string {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + "...";
}
