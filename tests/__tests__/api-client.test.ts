/**
 * Pruebas unitarias para el manejo de la API
 */

/// <reference path="../jest.d.ts" />
import axios from 'axios';
import { obtenerDesafioAPI } from '../api-client';
import { DesafioAPIResponse } from '../types';
import { APP_URLS } from '../config';
import { API_ENDPOINTS, API_HEADERS, API_TIMEOUTS } from '../api-config';
import '../types-extended';

// Declaraciones globales necesarias para las pruebas
declare global {
  var titulosCapturados: Record<string, string> | undefined;
}

// Función fail para manejo de pruebas
const fail = (message: string) => {
  throw new Error(message);
};

// Mockear axios para evitar llamadas reales a la API durante las pruebas
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Client Tests', () => {
  // Restaurar todos los mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('obtenerDesafioAPI debería realizar una llamada GET con parámetros correctos', async () => {
    // Arrange
    const bookTitle = 'Necronomicon';
    const unlockCode = 'NECRONOMICON1317';
    const siglo = 'XVII';
    const expectedParams = {
      params: {
        bookTitle,
        unlockCode
      },
      timeout: API_TIMEOUTS.conexion,
      headers: API_HEADERS
    };
    
    // Configurar el mock para simular una respuesta exitosa con campos requeridos
    const mockResponse = {
      status: 200,
      data: {
        success: true,
        challenge: {
          bookTitle: 'Necronomicon',
          hint: 'Busca las posiciones en el vault',
          vault: ['a', 'b', 'c', 'd', 'e'],
          targets: [2, 0, 3]
        },
        // Añadimos los campos requeridos según el código de la función
        cipherText: "texto cifrado",
        targetHash: "hash objetivo",
        range: [1, 1000]
      }
    };
    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    try {
      // Act
      const result = await obtenerDesafioAPI(bookTitle, unlockCode, siglo);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://backend-production-9d875.up.railway.app/api/cipher/challenge',
        expect.objectContaining({
          params: {
            bookTitle,
            unlockCode
          }
        })
      );
      expect(result).toBeDefined();
    } catch (error: any) {
      fail(`La prueba no debería fallar: ${error.message}`);
    }
  });

  test('obtenerDesafioAPI debería manejar errores de red', async () => {
    // Arrange
    const bookTitle = 'Necronomicon';
    const unlockCode = 'NECRONOMICON1317';
    const siglo = 'XVII';
    
    // Configurar el mock para simular un error de red
    const networkError = new Error('Network Error') as any;
    networkError.code = 'ECONNREFUSED';
    mockedAxios.get.mockRejectedValueOnce(networkError);

    try {
      // Act
      await obtenerDesafioAPI(bookTitle, unlockCode, siglo);
      // Si llegamos aquí, la prueba debe fallar
      fail('Se esperaba que la función lanzara una excepción');
    } catch (error: any) {
      // Assert
      expect(error.message).toContain('Error de conexión');
    }
  });

  test('obtenerDesafioAPI debería manejar errores específicos de la API', async () => {
    // Arrange
    const bookTitle = 'Necronomicon';
    const unlockCode = 'WRONG_CODE';
    const siglo = 'XVII';
    
    // Configurar el mock para simular un error de la API
    const apiError = {
      response: {
        status: 400,
        data: {
          success: false,
          error: 'Código de desbloqueo incorrecto'
        }
      }
    };
    mockedAxios.get.mockRejectedValueOnce(apiError);

    try {
      // Act
      await obtenerDesafioAPI(bookTitle, unlockCode, siglo);
      // Si llegamos aquí, la prueba debe fallar
      fail('Se esperaba que la función lanzara una excepción');
    } catch (error: any) {
      // Assert
      expect(error.message).toContain('Error de API');
    }
  });

  test('obtenerDesafioAPI debería manejar respuestas sin datos', async () => {
    // Arrange
    const bookTitle = 'Necronomicon';
    const unlockCode = 'NECRONOMICON1317';
    const siglo = 'XVII';
    
    // Configurar el mock para simular una respuesta sin los campos esperados
    const mockResponse = {
      status: 200,
      data: {}
    };
    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    try {
      // Act
      await obtenerDesafioAPI(bookTitle, unlockCode, siglo);
      // Si llegamos aquí, la prueba debe fallar
      fail('Se esperaba que la función lanzara una excepción');
    } catch (error: any) {
      // Assert
      expect(error.message).toContain('Respuesta de API inválida');
    }
  });
});
