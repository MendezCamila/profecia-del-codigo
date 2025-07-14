# Profecía del Código 📜

Un sistema automatizado para desbloquear manuscritos antiguos mediante la extracción de códigos alfanuméricos en PDFs y resolución de desafíos de la API.

## 📋 Descripción

Este proyecto implementa un conjunto de pruebas automatizadas con Playwright para interactuar con un portal web de manuscritos arcanos. El sistema navega por diferentes siglos, desbloquea manuscritos secuencialmente y extrae códigos de PDFs para resolver desafíos.

## 🔑 Características Principales

- **Extracción Inteligente de Códigos**: Sistema avanzado para extraer códigos alfanuméricos de documentos PDF utilizando múltiples estrategias.
- **Navegación Secuencial**: Procesamiento ordenado de manuscritos (Siglo XIV → XV → XVI → XVII → XVIII).
- **Manejo Robusto de Errores**: Estrategias de respaldo y recuperación en cada etapa del proceso.
- **Patrón de Diseño Modular**: Arquitectura separada en configuración, constantes y utilidades para facilitar el mantenimiento.

## 🛠️ Estructura del Proyecto

```
profecia-del-codigo/
├── tests/
│   ├── danza-hibrida.spec.ts          # Script principal para el desbloqueo de manuscritos
│   ├── config.ts                      # Configuración centralizada (URLs, credenciales, timeouts)
│   ├── constants.ts                   # Constantes compartidas (patrones regex, selectores DOM)
│   ├── utils.ts                       # Funciones de utilidad reutilizables
│   ├── types.ts                       # Definiciones de tipos TypeScript
│   ├── logger.ts                      # Sistema de logs centralizado
│   ├── api-client.ts                  # Cliente para conectar con la API de desafíos
│   ├── api-config.ts                  # Configuración específica para la API
│   ├── code-extractor-factory.ts      # Implementación del patrón Factory para extractores
│   ├── code-history.json              # Historial de códigos encontrados
│   ├── __tests__/                     # Pruebas unitarias
│   │   ├── api-client.test.ts         # Pruebas para el cliente API
│   │   └── api-simple.test.ts         # Pruebas simplificadas para referencia
│   └── downloads/                     # Directorio para PDFs descargados
├── jest.config.json                   # Configuración de Jest para pruebas unitarias
├── playwright.config.ts               # Configuración de Playwright
├── tsconfig.json                      # Configuración de TypeScript
├── .gitignore                         # Archivos ignorados por Git
└── package.json                       # Dependencias del proyecto
```

## 🚀 Cómo Ejecutar las Pruebas

### Prerrequisitos

- Node.js v14 o superior
- NPM o Yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Instalar navegadores para Playwright
npx playwright install
```

### Ejecución

```bash
# Ejecutar la danza de siglos híbrida
npx playwright test danza-hibrida.spec.ts --project=chromium

# Ejecutar con navegador visible
npx playwright test danza-hibrida.spec.ts --project=chromium --headed

# Ejecutar las pruebas unitarias
npx jest
```

## 🧠 Lógica de Desbloqueo

1. **Login**: Accede al portal utilizando credenciales configuradas
2. **Secuencia de Desbloqueo**:
   - Inicia con el Siglo XIV y desbloquea manuscritos secuencialmente
   - Cada manuscrito desbloqueado proporciona el código para el siguiente
3. **Extracción de Códigos**:
   - Los códigos se extraen de PDFs descargados usando múltiples métodos
   - Todos los códigos siguen un patrón alfanumérico (ej: AUREUS1350, NECRONOMICON1317)
4. **Segunda Dimensión**: Al completar la secuencia principal, navega a la segunda página

## 🛡️ Estrategias de Respaldo

El sistema utiliza múltiples estrategias para garantizar un funcionamiento robusto:

- **Extracción Progresiva**: Intenta diferentes métodos de extracción en orden de sofisticación
- **Códigos Predefinidos**: Usa códigos de respaldo si falla la extracción
- **Manejo de Errores**: Implementa recuperación automática ante errores de API o interfaz
- **Histórico de Códigos**: Mantiene un registro persistente de códigos encontrados

## 📊 Resultados

Al finalizar la ejecución, el script muestra un resumen de los códigos encontrados para cada siglo, proporcionando una visión clara del progreso y éxito de la operación.

## 🧪 Pruebas Unitarias

El proyecto incluye pruebas unitarias implementadas con Jest para garantizar el correcto funcionamiento de los componentes individuales:

- **Pruebas de API**: Verifican la correcta interacción con la API de desafíos
  - Validación de parámetros de solicitud
  - Manejo de respuestas exitosas
  - Gestión de errores de red
  - Manejo de respuestas de error de la API

### Ejecución de Pruebas

```bash
# Ejecutar todas las pruebas unitarias
npx jest

# Ejecutar pruebas específicas
npx jest tests/__tests__/api-client.test.ts

# Ejecutar pruebas con información detallada
npx jest --verbose
```