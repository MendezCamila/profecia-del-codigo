/**
 * Factoría para crear diferentes estrategias de extracción de códigos
 */

import { CodeExtractorStrategy } from './types';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { REGEX_PATTERNS } from './constants';
import { BACKUP_CODES } from './config';
import { logInfo, logSuccess, logWarning, logError } from './logger';

/**
 * Estrategia que utiliza pdf-parse para extraer texto
 */
class PdfParseExtractor implements CodeExtractorStrategy {
  async extract(pdfPath: string, siglo: string): Promise<string | null> {
    try {
      logInfo(`Extrayendo código con pdf-parse de ${pdfPath}`);
      const buffer = fs.readFileSync(pdfPath);
      const pdf = await pdfParse(buffer);
      
      // Buscar código en el texto extraído
      const code = this.findCodeInText(pdf.text, siglo);
      if (code) {
        logSuccess(`Código encontrado con pdf-parse: ${code}`);
        return code;
      }
      
      return null;
    } catch (error: any) {
      logError(`Error al extraer con pdf-parse: ${error.message || 'Error desconocido'}`, error);
      return null;
    }
  }

  private findCodeInText(text: string, siglo: string): string | null {
    // Implementación para encontrar códigos basada en patrones específicos por siglo
    const patterns = this.getPatternsBySiglo(siglo);
    
    // Normalizar texto
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    
    // Buscar usando patrones
    for (const pattern of patterns) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        return match[1].trim().toUpperCase();
      }
    }
    
    return null;
  }
  
  private getPatternsBySiglo(siglo: string): RegExp[] {
    // Usar diferentes patrones según el siglo
    switch(siglo) {
      case 'XVII': 
        return [REGEX_PATTERNS.NECRONOMICON, REGEX_PATTERNS.NECRO_SHORT, REGEX_PATTERNS.ALFANUMERIC_CODE];
      case 'XVIII': 
        return [REGEX_PATTERNS.MALLEUS, REGEX_PATTERNS.ALFANUMERIC_CODE];
      default: 
        return [REGEX_PATTERNS.ALFANUMERIC_CODE];
    }
  }
}

/**
 * Estrategia que utiliza texto crudo del PDF
 */
class RawTextExtractor implements CodeExtractorStrategy {
  async extract(pdfPath: string, siglo: string): Promise<string | null> {
    try {
      logInfo(`Extrayendo código con texto crudo de ${pdfPath}`);
      const fileData = fs.readFileSync(pdfPath);
      const fileContent = fileData.toString('utf-8', 0, Math.min(fileData.length, 10000));
      
      // Buscar patrones específicos según el siglo
      const patterns = this.getPatternsForSiglo(siglo);
      
      for (const pattern of patterns) {
        const match = fileContent.match(pattern);
        if (match && match[1]) {
          logSuccess(`Código encontrado con texto crudo: ${match[1]}`);
          return match[1].toUpperCase();
        }
      }
      
      return null;
    } catch (error: any) {
      logError(`Error al extraer con texto crudo: ${error.message || 'Error desconocido'}`, error);
      return null;
    }
  }
  
  private getPatternsForSiglo(siglo: string): RegExp[] {
    // Implementación para obtener patrones específicos por siglo
    // Similar a PdfParseExtractor pero con patrones optimizados para texto crudo
    switch(siglo) {
      case 'XVII': 
        return [REGEX_PATTERNS.NECRONOMICON, REGEX_PATTERNS.NECRO_SHORT, REGEX_PATTERNS.ALFANUMERIC_CODE];
      case 'XVIII': 
        return [REGEX_PATTERNS.MALLEUS, REGEX_PATTERNS.ALFANUMERIC_CODE];
      default: 
        return [REGEX_PATTERNS.ALFANUMERIC_CODE];
    }
  }
}

/**
 * Estrategia de respaldo que utiliza códigos predefinidos
 */
class BackupCodeExtractor implements CodeExtractorStrategy {
  async extract(_pdfPath: string, siglo: string): Promise<string | null> {
    logWarning(`Usando código de respaldo para siglo ${siglo}`);
    return BACKUP_CODES[siglo] || null;
  }
}

/**
 * Factory para crear extractores de código
 */
export class CodeExtractorFactory {
  /**
   * Crea una cadena de extractores en orden de preferencia
   */
  static createExtractorChain(): CodeExtractorStrategy[] {
    return [
      new PdfParseExtractor(),
      new RawTextExtractor(),
      new BackupCodeExtractor()
    ];
  }
}
