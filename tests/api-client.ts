import axios from 'axios';
import { 
  API_BASE_URL, 
  API_ENDPOINTS, 
  API_HEADERS, 
  API_TIMEOUTS 
} from './api-config';

/**
 * Obtiene un desafío desde la API basado en el título del manuscrito, código de desbloqueo y siglo
 * Esta función realiza una conexión real con la API de manuscritos arcanos
 * No incluye simulaciones ni fallbacks para que la prueba técnica verifique la conexión real
 */
export async function obtenerDesafioAPI(tituloManuscrito: string, codigoDesbloqueo: string, siglo: string): Promise<any> {
  try {
    console.log(`📡 Conectando con la API para obtener desafío del manuscrito "${tituloManuscrito}" (Siglo ${siglo})...`);
    
    // Axios ya está importado al inicio del archivo
    
    // URL correcta de la API según la documentación proporcionada
    const apiUrl = 'https://backend-production-9d875.up.railway.app/api/cipher/challenge';
    
    // Preparar los parámetros para la petición GET según especificación
    const params = {
      bookTitle: tituloManuscrito,
      unlockCode: codigoDesbloqueo
    };
    
    console.log(`📡 Llamando API con bookTitle="${tituloManuscrito}" y unlockCode="${codigoDesbloqueo}"...`);
    
    console.log(`📤 Enviando parámetros a la API: ${JSON.stringify(params)}`);
    
    console.log(`🔗 Conectando con la API en: ${apiUrl}`);
    
    try {
      // Realizar la petición GET a la API con los parámetros correctos
      const respuesta = await axios.get(apiUrl, {
        params: params,
        timeout: API_TIMEOUTS.conexion,
        headers: API_HEADERS
      });
      
      // Verificar si la respuesta es exitosa
      if (respuesta.status === 200 && respuesta.data) {
        console.log('✅ Respuesta exitosa de la API');
        
        // Validar que la respuesta contenga los campos necesarios
        const desafio = respuesta.data;
        if (desafio && desafio.cipherText && desafio.targetHash && desafio.range) {
          console.log(`✅ Desafío obtenido correctamente: ${JSON.stringify(desafio)}`);
          return desafio;
        } else {
          console.log('⚠️ La respuesta de la API no contiene todos los campos necesarios');
          throw new Error('Respuesta de API inválida: No contiene los campos requeridos');
        }
      } else {
        console.log(`⚠️ La API respondió con estado ${respuesta.status}`);
        throw new Error(`API respondió con estado ${respuesta.status}`);
      }
    } catch (err) {
      // Dejar que el error se propague para que sea manejado por el catch exterior
      const error = err as any;
      console.log(`📡 Error en la llamada a la API: ${error?.message || 'Error desconocido'}`);
      
      // Registrar detalles adicionales del error para depuración
      if (error?.response) {
        console.log(`🔍 Detalles de la respuesta: ${JSON.stringify(error.response.data || {})}`);
      }
      
      // Relanzar el error para que se maneje adecuadamente
      throw error;
    }
  } catch (err) {
    // Convertir a any para poder acceder a las propiedades
    const error = err as any;
    
    // Capturar error específico de conexión rechazada
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      console.log('⚠️ No se pudo conectar con el servidor de la API, podría estar fuera de línea');
      throw new Error(`Error de conexión: No se pudo conectar con la API - ${error?.message || 'Desconocido'}`);
    } else if (error?.response) {
      // La API respondió con un código de error
      console.log(`❌ Error en llamada API: ${error?.message || 'Desconocido'}`);
      
      // Mostrar detalles de la respuesta si están disponibles
      if (error.response.data) {
        console.log(`📄 Detalles del error: ${JSON.stringify(error.response.data)}`);
      }
      
      throw new Error(`Error de API: ${error.response?.status || 'Desconocido'} - ${JSON.stringify(error.response?.data || {})}`);
    } else if (error?.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.log('⚠️ No se recibió respuesta de la API');
      throw new Error('No se recibió respuesta de la API después del tiempo de espera');
    } else {
      // Error al configurar la solicitud
      console.log(`❌ Error al configurar la solicitud a la API: ${error?.message || 'Error desconocido'}`);
      throw new Error(`Error de configuración: ${error?.message || 'Error desconocido'}`);
    }
  }
}
