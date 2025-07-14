/**
 * Definiciones de tipos para el proyecto
 */

// Tipo para los códigos organizados por siglo
export type SigloCodigos = {
  [siglo: string]: string;
};

// Tipo para representar los títulos de manuscritos
export type TituloManuscrito = {
  [siglo: string]: string;
};

// Definición para la respuesta de la API de desafíos
export interface DesafioAPIResponse {
  success: boolean;
  challenge?: {
    bookTitle?: string;
    hint?: string;
    vault?: any[];
    targets?: number[];
  };
  error?: string;
}

// Definición de un extractor de códigos
export interface CodeExtractorStrategy {
  extract(pdfPath: string, siglo: string): Promise<string | null>;
}

// Estado del procesamiento de manuscritos
export interface ProcesamientoEstado {
  sigloActual: string;
  siglosProcesados: Record<string, boolean>;
  intentos: number;
  todosCompletados: boolean;
}
