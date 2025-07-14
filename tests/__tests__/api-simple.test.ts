/**
 * Pruebas unitarias simplificadas para el manejo de la API
 */

import axios from 'axios';
import { API_HEADERS, API_TIMEOUTS } from '../api-config';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Función simplificada para probar
const simplifiedApiCall = async (bookTitle: string, unlockCode: string): Promise<any> => {
  try {
    const apiUrl = 'https://backend-production-9d875.up.railway.app/api/cipher/challenge';
    
    const response = await axios.get(apiUrl, {
      params: {
        bookTitle,
        unlockCode
      },
      timeout: API_TIMEOUTS.conexion,
      headers: API_HEADERS
    });
    
    return response.data;
  } catch (error: any) {
    console.error(`Error en la llamada a la API: ${error?.message || 'Error desconocido'}`);
    return null;
  }
};

describe('API Simple Tests', () => {
  test('should make an API call successfully', async () => {
    // Arrange
    const bookTitle = 'Necronomicon';
    const unlockCode = 'NECRONOMICON1317';
    
    // Setup mock
    const mockResponse = {
      data: { success: true, message: 'API call successful' }
    };
    mockedAxios.get.mockResolvedValueOnce(mockResponse);
    
    // Act
    const result = await simplifiedApiCall(bookTitle, unlockCode);
    
    // Assert
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://backend-production-9d875.up.railway.app/api/cipher/challenge',
      expect.objectContaining({
        params: { bookTitle, unlockCode }
      })
    );
    expect(result).toEqual(mockResponse.data);
  });
});
