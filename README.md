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
│   ├── danza-hibrida.spec.ts    # Script principal para el desbloqueo de manuscritos
│   ├── config.ts                # Configuración centralizada (URLs, credenciales, timeouts)
│   ├── constants.ts             # Constantes compartidas (patrones regex, selectores DOM)
│   ├── utils.ts                 # Funciones de utilidad reutilizables
│   ├── api-client.ts            # Cliente para conectar con la API de desafíos
│   ├── code-history.json        # Historial de códigos encontrados
│   └── downloads/               # Directorio para PDFs descargados
├── playwright.config.ts         # Configuración de Playwright
└── package.json                 # Dependencias del proyecto
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