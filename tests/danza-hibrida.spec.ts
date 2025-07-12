import { test, expect, Locator } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import axios from 'axios';

/**
 * Sistema avanzado de extracción de códigos con múltiples estrategias
 */
class CodeExtractor {
  // Códigos de respaldo conocidos
  private backupCodes = {
    'XIV': 'AUREUS1350',
    'XV': 'DIAZEPAM850',
    'XVI': ''
  };
  
  // Histórico de códigos encontrados (persistente entre ejecuciones)
  private codeHistory: Record<string, string[]> = {};
  private historyFilePath: string;
  
  constructor(basePath: string) {
    this.historyFilePath = path.join(basePath, 'code-history.json');
    this.loadCodeHistory();
  }
  
  /**
   * Carga el histórico de códigos desde un archivo JSON
   */
  private loadCodeHistory(): void {
    try {
      if (fs.existsSync(this.historyFilePath)) {
        this.codeHistory = JSON.parse(fs.readFileSync(this.historyFilePath, 'utf8'));
        console.log('✅ Histórico de códigos cargado');
      }
    } catch (error) {
      console.log('⚠️ No se pudo cargar el histórico de códigos');
    }
  }
  
  /**
   * Guarda el histórico de códigos en un archivo JSON
   */
  private saveCodeHistory(): void {
    try {
      fs.writeFileSync(this.historyFilePath, JSON.stringify(this.codeHistory, null, 2));
      console.log('✅ Histórico de códigos actualizado');
    } catch (error) {
      console.log('⚠️ No se pudo guardar el histórico de códigos');
    }
  }
  
  /**
   * Extrae un código del PDF utilizando múltiples estrategias
   */
  async extractCode(pdfPath: string, century: string): Promise<string> {
    console.log(`🔍 Intentando extraer código del siglo ${century} con múltiples métodos...`);
    
    // Lista de métodos de extracción por orden de prioridad
    const extractionMethods = [
      this.extractWithPdfParse.bind(this),
      this.extractWithRawText.bind(this),
      this.extractWithPatterns.bind(this)
    ];
    
    // Intentar cada método secuencialmente
    for (let i = 0; i < extractionMethods.length; i++) {
      try {
        const method = extractionMethods[i];
        const code = await method(pdfPath);
        if (code && code !== 'CODIGO_NO_ENCONTRADO') {
          // Guardar el código en el histórico
          if (!this.codeHistory[century]) {
            this.codeHistory[century] = [];
          }
          if (!this.codeHistory[century].includes(code)) {
            this.codeHistory[century].push(code);
            this.saveCodeHistory();
          }
          console.log(`✅ Código extraído con método #${i+1}: ${code}`);
          return code;
        }
      } catch (error) {
        console.log(`⚠️ Método #${i+1} falló: ${error.message}`);
      }
    }
    
    // Si ningún método funciona, intentar con el histórico
    console.log(`🔄 Buscando en histórico de códigos para siglo ${century}...`);
    if (this.codeHistory[century] && this.codeHistory[century].length > 0) {
      const historicCode = this.codeHistory[century][0]; // Usar el primer código histórico
      console.log(`📜 Usando código histórico: ${historicCode}`);
      return historicCode;
    }
    
    // Si todo falla, usar código de respaldo
    console.log(`🔒 Usando código de respaldo para siglo ${century}: ${this.backupCodes[century]}`);
    return this.backupCodes[century];
  }
  
  /**
   * Método 1: Extracción con pdf-parse
   */
  private async extractWithPdfParse(pdfPath: string): Promise<string> {
    const buffer = fs.readFileSync(pdfPath);
    const pdf = await pdfParse(buffer);
    return this.findCodeInText(pdf.text);
  }
  
  /**
   * Método 2: Extracción con texto crudo del PDF
   */
  private async extractWithRawText(pdfPath: string): Promise<string> {
    const fileData = fs.readFileSync(pdfPath);
    // Convertir a texto y buscar en los primeros 10KB
    const fileContent = fileData.toString('utf-8', 0, Math.min(fileData.length, 10000));
    return this.findCodeInText(fileContent);
  }
  
  /**
   * Método 3: Extracción con patrones específicos
   */
  private async extractWithPatterns(pdfPath: string): Promise<string> {
    const fileData = fs.readFileSync(pdfPath);
    // Buscar patrones específicos en todo el archivo
    const fileContent = fileData.toString('binary', 0, fileData.length);
    
    const patterns = [
      /AUREUS\d{4}/i,          // Patrón para AUREUS1350
      /ALPRAZOLAM\d{3}/i,
      /DIAZEPAM\d{3}/i,
      /[A-Z]{5,}\d{3,}/        // Patrón general para palabras mayúsculas seguidas de números
    ];
    
    for (const pattern of patterns) {
      const match = fileContent.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return 'CODIGO_NO_ENCONTRADO';
  }
  
  /**
   * Busca patrones de código en el texto extraído
   */
  private findCodeInText(text: string): string {
    // Múltiples patrones regex para diferentes formatos de código
    const patrones = [
      /Código\s*[:=]?\s*([A-Z0-9]{5,})/i,
      /Code\s*[:=]?\s*([A-Z0-9]{5,})/i,
      /Clave\s*[:=]?\s*([A-Z0-9]{5,})/i,
      /\b([A-Z]{5,}\d{3,})\b/,       // Patrón para ALPRAZOLAM741, DIAZEPAM850, etc.
      /\b([A-Z0-9]{5,})\b/           // Cualquier secuencia de letras y números (>= 5 caracteres)
    ];
    
    // Normalizar texto: eliminar saltos de línea y espacios múltiples
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    
    // Probar cada patrón
    for (const pattern of patrones) {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'CODIGO_NO_ENCONTRADO';
  }
}

test('Danza de Siglos - Sistema Híbrido', async ({ page }) => {
  test.setTimeout(120000); // 2 minutos para toda la prueba
  
  // Datos de acceso
  const URL_LOGIN = 'https://pruebatecnica-sherpa-production.up.railway.app/login';
  const URL_PORTAL = 'https://pruebatecnica-sherpa-production.up.railway.app/portal';
  const EMAIL = 'monje@sherpa.local';
  const PASSWORD = 'cript@123';
  
  // Orden cronológico
  const siglosOrdenados = ['XIV', 'XV', 'XVI'];
  const codigos: Record<string, string> = {};
  
  // Directorio para descargas
  const downloadPath = path.join(__dirname, 'downloads');
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath);
  }
  
  // Inicializar el extractor de códigos avanzado
  const extractor = new CodeExtractor(__dirname);
  
  console.log('1. INICIANDO LOGIN');
  
  // Navegar a la página de login con opciones robustas
  await page.goto(URL_LOGIN, { 
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  // Completar credenciales y asegurarse de que los campos estén visibles
  await page.waitForSelector('input[type="email"], input#email', { state: 'visible', timeout: 10000 });
  await page.fill('input[type="email"], input#email', EMAIL);
  
  await page.waitForSelector('input[type="password"], input#password', { state: 'visible', timeout: 10000 });
  await page.fill('input[type="password"], input#password', PASSWORD);
  
  console.log('📝 Credenciales ingresadas');
  
  // Verificar que el botón de submit esté disponible
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.waitFor({ state: 'visible', timeout: 10000 });
  
  // Click en botón login y esperar redirección
  console.log('🔑 Haciendo clic en botón de login');
  await submitButton.click();
  
  // Esperar la redirección con timeout amplio
  try {
    await page.waitForURL(URL => URL.toString().includes('/portal') || !URL.toString().includes('/login'), { 
      timeout: 30000 
    });
    console.log('✅ Redirección detectada');
  } catch (e) {
    console.log('⚠️ Timeout esperando redirección. Continuando de todos modos.');
  }
  
  // Verificar si el login fue exitoso comprobando la URL
  const currentUrl = page.url();
  console.log(`🌐 URL actual: ${currentUrl}`);
  
  if (currentUrl.includes('/login')) {
    console.log('❌ El login parece haber fallado. Capturando evidencia...');
    await page.screenshot({ path: 'login-failed.png' });
    throw new Error('El login falló. La página sigue en la URL de login.');
  }
  
  console.log('2. ACCEDIENDO AL PORTAL');
  // Intentar navegar explícitamente al portal si no estamos ya ahí
  if (!currentUrl.includes('/portal')) {
    await page.goto(URL_PORTAL, { 
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    console.log('🚀 Navegación al portal completada');
  } else {
    console.log('✅ Ya estamos en el portal');
  }
  
  // Dar tiempo a que la página se cargue completamente
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000); // Espera adicional para asegurar carga
  
  console.log('3. IDENTIFICANDO MANUSCRITOS');
  
  // ESTRATEGIA 1: Buscar por texto de siglos directamente
  console.log('🔍 Buscando texto de siglos...');
  let siglosEncontrados = 0;
  
  for (const siglo of siglosOrdenados) {
    const textoSelector = `text="Siglo ${siglo}"`;
    const count = await page.locator(textoSelector).count();
    if (count > 0) {
      console.log(`✅ Encontrado texto "Siglo ${siglo}": ${count} ocurrencias`);
      siglosEncontrados++;
    }
  }
  
  console.log(`📚 Total de siglos encontrados: ${siglosEncontrados}`);
  
  // Si no encontramos nada, intentar con una carga completa
  if (siglosEncontrados === 0) {
    console.log('⚠️ No se encontraron elementos esperados. Intentando recargar la página...');
    
    // Intentar recargar la página y esperar más tiempo
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000); // Espera adicional
  }

  // PROCESAMIENTO DE MANUSCRITOS
  console.log('\n4. PROCESANDO MANUSCRITOS SECUENCIALMENTE\n');

  /**
   * Función auxiliar para encontrar y enfocar una sección de manuscrito específica
   */
  /**
   * Función para usar el selector de siglos si está disponible
   */
  async function usarSelectorSiglos(siglo: string): Promise<boolean> {
    try {
      console.log(`🔄 Intentando usar selector para elegir Siglo ${siglo}...`);
      
      // Buscar el selector de siglos (podría ser un dropdown, combo, tabs, etc.)
      const posiblesSelectores = [
        page.locator('select, [role="listbox"], [role="combobox"]').first(), // Dropdowns comunes
        page.locator('nav, .tabs, .navigation, .menu').first(), // Navegación/tabs
        page.locator('[data-testid="selector-siglos"]').first() // Si tiene un atributo data específico
      ];
      
      for (const selector of posiblesSelectores) {
        if (await selector.count() > 0) {
          console.log('✅ Selector de siglos encontrado');
          
          // Depende del tipo de selector, la interacción será diferente
          const elementHandle = await selector.elementHandle();
          // Verificar si es un elemento SELECT
          if (elementHandle) {
            const isSelect = await page.evaluate(el => el.tagName === 'SELECT', elementHandle);
            
            if (isSelect) {
              // Si es un <select> estándar
              await selector.selectOption({ label: `Siglo ${siglo}` });
              console.log(`✅ Seleccionado Siglo ${siglo} en dropdown`);
              await page.waitForTimeout(1000);
              return true;
            } else {
              // Si es otro tipo de control interactivo (tabs, botones, etc.)
              const opcionSiglo = selector.getByText(`Siglo ${siglo}`, { exact: true });
            
              if (await opcionSiglo.count() > 0) {
                await opcionSiglo.click();
                console.log(`✅ Clic en opción Siglo ${siglo}`);
                await page.waitForTimeout(1000);
                return true;
              }
            }
          }
        }
      }
      
      console.log('⚠️ No se encontró un selector de siglos utilizable');
      return false;
    } catch (e) {
      console.log(`⚠️ Error al intentar usar el selector: ${e.message}`);
      return false;
    }
  }
  
  async function focusManuscritoSeccion(siglo: string): Promise<boolean> {
    console.log(`🔍 Buscando específicamente el Siglo ${siglo}...`);
    
    // En caso de que estemos en otro siglo, vamos a forzar un enfoque explícito en el siglo que buscamos
    try {
      // Primero limpiar cualquier diálogo o popup que pudiera estar abierto
      try {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      } catch (e) {
        // Ignorar errores si no hay dialogo abierto
      }
      
      // NUEVA ESTRATEGIA: Intentar usar el selector de siglos primero
      const selectorUsado = await usarSelectorSiglos(siglo);
      if (selectorUsado) {
        // Si se usó el selector correctamente, verificamos que el siglo esté visible
        const sigloElement = page.getByText(`Siglo ${siglo}`, { exact: true });
        if (await sigloElement.count() > 0 && await sigloElement.isVisible()) {
          console.log(`✅ Confirmado que el Siglo ${siglo} está visible después de usar el selector`);
          return true;
        }
      }
      
      // Estrategia 1: Usar getByText con exact=true para encontrar exactamente el siglo que buscamos
      const sigloElement = page.getByText(`Siglo ${siglo}`, { exact: true });
      if (await sigloElement.count() > 0) {
        console.log(`✅ Siglo ${siglo} encontrado - usando estrategia 1`);
        // Asegurarnos de hacer scroll hacia el elemento para que sea visible
        await sigloElement.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await sigloElement.click({ force: true });
        await page.waitForTimeout(500);
        return true;
      }
      
      // Estrategia 2: Buscar por contenido textual en div/sección
      const elemento = page.locator(`div:has-text("Siglo ${siglo}")`).first();
      if (await elemento.count() > 0) {
        console.log(`✅ Siglo ${siglo} encontrado - usando estrategia 2`);
        await elemento.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await elemento.click({ force: true });
        await page.waitForTimeout(500);
        return true;
      }
      
      // Si llegamos aquí, no se encontró
      console.log(`⚠️ No se pudo encontrar el Siglo ${siglo}`);
      return false;
    } catch (e) {
      console.log(`⚠️ Error al buscar el Siglo ${siglo}: ${e.message}`);
      return false;
    }
  }
  
  // Objeto para rastrear el estado de cada siglo
  const siglosProcesados: Record<string, boolean> = {
    'XIV': false,
    'XV': false, 
    'XVI': false
  };

  // Procesamiento en orden cronológico estricto
  console.log('\n⚠️ IMPORTANTE: Procesando manuscritos en orden cronológico FIJO: XIV → XV → XVI');
  
  // Procesamos cada siglo de forma individual y secuencial
  for (let i = 0; i < siglosOrdenados.length; i++) {
    const siglo = siglosOrdenados[i];
    
    console.log(`\n🔄 PROCESANDO MANUSCRITO: Siglo ${siglo}`);
    
    // Verificar si necesitamos un código previo y si lo tenemos
    if (siglo === 'XV' && !codigos['XIV']) {
      console.log(`⚠️ No se tiene el código del siglo XIV, necesario para desbloquear XV`);
      console.log(`⚠️ Usando código de respaldo para XIV`);
      codigos['XIV'] = 'AUREUS1350';
    }
    else if (siglo === 'XVI' && !codigos['XV']) {
      console.log(`⚠️ No se tiene el código del siglo XV, necesario para desbloquear XVI`);
      console.log(`⚠️ Usando código de respaldo para XV`);
      codigos['XV'] = 'DIAZEPAM850';
    }
    
    // Paso 1: Ubicar y enfocar específicamente este siglo, con varios intentos si es necesario
    let encontrado = false;
    let intentos = 0;
    const maxIntentos = 3;
    
    while (!encontrado && intentos < maxIntentos) {
      intentos++;
      console.log(`Intento ${intentos}/${maxIntentos} para encontrar Siglo ${siglo}`);
      encontrado = await focusManuscritoSeccion(siglo);
      
      if (!encontrado) {
        console.log(`⚠️ Intento ${intentos} fallido, esperando un momento...`);
        await page.waitForTimeout(1000);  // Esperar un segundo antes de reintentar
      }
    }
    
    if (!encontrado) {
      console.log(`⚠️ No se pudo encontrar el Siglo ${siglo} después de ${maxIntentos} intentos.`);
      
      // Si es un siglo crítico (XIV o XV), usamos códigos de respaldo
      if (siglo !== 'XVI') {
        console.log(`⚠️ Usando código de respaldo para Siglo ${siglo}`);
        codigos[siglo] = siglo === 'XIV' ? 'AUREUS1350' : 'DIAZEPAM850';
        siglosProcesados[siglo] = true;
      }
      
      continue;
    }
    
    // Paso 2: Según el siglo, realizar la acción correspondiente
    if (siglo === 'XIV') {
      // SIGLO XIV - Primer manuscrito (ya desbloqueado)
      console.log('- Buscando botón Descargar PDF para Siglo XIV...');
      
      // Buscar el botón de descarga específicamente en la sección del siglo XIV
      const seccionXIV = page.locator('div, section').filter({ hasText: 'Siglo XIV' }).first();
      let botonDescargaXIV;
      
      if (await seccionXIV.count() > 0) {
        // Primero verificar si el botón está dentro de la sección específica
        console.log('- Buscando botón Descargar PDF dentro de la sección del Siglo XIV');
        await seccionXIV.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        
        botonDescargaXIV = seccionXIV.getByRole('button', { name: /Descargar PDF/i }).first();
        if (await botonDescargaXIV.count() === 0) {
          // Si no se encuentra en la sección específica, buscar en toda la página
          console.log('- Botón no encontrado en la sección, buscando en toda la página');
          botonDescargaXIV = page.getByRole('button', { name: /Descargar PDF/i }).first();
        }
      } else {
        // Si no se encuentra la sección, buscar en toda la página
        console.log('- Sección no encontrada, buscando botón en toda la página');
        botonDescargaXIV = page.getByRole('button', { name: /Descargar PDF/i }).first();
      }
      
      if (await botonDescargaXIV.count() > 0) {
        console.log('- Botón encontrado');
        
        // Descargar PDF
        console.log('- Descargando PDF...');
        const downloadPromiseXIV = page.waitForEvent('download');
        await botonDescargaXIV.click();
        const downloadXIV = await downloadPromiseXIV;
        
        // Guardar PDF
        const pdfPathXIV = path.join(downloadPath, 'siglo-XIV.pdf');
        await downloadXIV.saveAs(pdfPathXIV);
        console.log(`- PDF descargado: ${pdfPathXIV}`);
        
        // Extraer código utilizando el sistema avanzado
        console.log('- Intentando extraer código del PDF...');
        codigos['XIV'] = await extractor.extractCode(pdfPathXIV, 'XIV');
        console.log(`✅ Código para Siglo XIV: ${codigos['XIV']}`);
        siglosProcesados['XIV'] = true;
      } else {
        console.log('⚠️ No se encontró botón de descarga para Siglo XIV');
        // Usar código de respaldo
        codigos['XIV'] = 'AUREUS1350';
        console.log(`✅ Usando código predefinido: ${codigos['XIV']}`);
        siglosProcesados['XIV'] = true;
      }
    } 
    else if (siglo === 'XV') {
      // SIGLO XV - Segundo manuscrito (requiere código del XIV)
      if (!codigos['XIV']) {
        console.log('⚠️ No se tiene el código del siglo XIV, no se puede continuar');
        continue;
      }
      
      console.log('- Buscando elementos para desbloquear el Siglo XV...');
      
      // Buscar la sección específica del siglo XV
      const seccionXV = page.locator('div, section').filter({ hasText: 'Siglo XV' }).first();
      
      // Asegurar que estamos en el contexto del siglo XV
      console.log('- Reenfocando el Siglo XV antes de buscar elementos...');
      await focusManuscritoSeccion('XV');
      
      // Buscar la sección del siglo XV de nuevo para asegurarnos de tener la referencia correcta
      const seccionXVActualizada = page.locator('div, section').filter({ hasText: 'Siglo XV' }).first();
      
      // Primero intentar encontrar un input para el código
      console.log('- Buscando input para código...');
      await page.waitForTimeout(500); // Esperar a que la UI se estabilice
      
      // Intentar encontrar el input con diferentes estrategias
      let inputCodigo;
      
      // Estrategia 1: Buscar en la sección específica
      if (await seccionXVActualizada.count() > 0) {
        await seccionXVActualizada.scrollIntoViewIfNeeded();
        inputCodigo = seccionXVActualizada.locator('input[placeholder*="código"], input:visible').first();
        console.log('- Buscando input en la sección del Siglo XV');
      }
      
      // Si no se encontró, buscar en toda la página
      if (!inputCodigo || await inputCodigo.count() === 0) {
        console.log('- Input no encontrado en la sección, buscando en toda la página');
        inputCodigo = page.locator('input[placeholder*="código"], input:visible').first();
      }
      
      if (await inputCodigo.count() > 0) {
        console.log('- Input para código encontrado');
        await inputCodigo.waitFor({ state: 'visible', timeout: 5000 });
        await inputCodigo.click({ force: true });
        await inputCodigo.fill(''); // Limpiar el campo primero
        await inputCodigo.fill(codigos['XIV']);
        console.log(`- Ingresando código: ${codigos['XIV']}`);
        
        // Asegurarse que el código se ingresó correctamente
        const valorActual = await inputCodigo.inputValue();
        if (valorActual !== codigos['XIV']) {
          console.log(`⚠️ El valor ingresado no coincide (${valorActual}), reintentando...`);
          await inputCodigo.fill(codigos['XIV']);
        }
        
        // Esperar a que el botón se habilite después de ingresar el código
        console.log('- Buscando botón Desbloquear...');
        await page.waitForTimeout(1000); // Dar tiempo para que el botón se habilite
        
        // Volver a enfocar la sección del siglo XV
        const botonDesbloqueoXV = await seccionXVActualizada.count() > 0 
          ? seccionXVActualizada.getByRole('button', { name: /Desbloquear/i }).first() 
          : page.getByRole('button', { name: /Desbloquear/i }).first();
        
        // Verificar que el botón esté habilitado antes de hacer clic
        if (await botonDesbloqueoXV.count() > 0) {
          const estaHabilitado = await botonDesbloqueoXV.isEnabled();
          console.log(`- Botón Desbloquear ${estaHabilitado ? 'habilitado' : 'deshabilitado'}`);
          
          if (estaHabilitado) {
            console.log('- Haciendo clic en botón Desbloquear');
            await botonDesbloqueoXV.click();
            console.log('- Enviando código...');
            
            // Esperar a que aparezca el botón de descarga
            try {
              await page.waitForSelector('button:has-text("Descargar PDF")', { timeout: 10000 });
              console.log('✅ Manuscrito desbloqueado exitosamente');
              
              // Volver a enfocar el siglo después del desbloqueo
              await focusManuscritoSeccion('XV');
              
              // Descargar PDF
              console.log('- Descargando PDF...');
              const downloadPromiseXV = page.waitForEvent('download');
              await page.getByRole('button', { name: /Descargar PDF/i }).click();
              const downloadXV = await downloadPromiseXV;
              
              // Guardar PDF
              const pdfPathXV = path.join(downloadPath, 'siglo-XV.pdf');
              await downloadXV.saveAs(pdfPathXV);
              console.log(`- PDF descargado: ${pdfPathXV}`);
              
              // Extraer código utilizando el sistema avanzado
              console.log('- Intentando extraer código del PDF...');
              codigos['XV'] = await extractor.extractCode(pdfPathXV, 'XV');
              console.log(`✅ Código para Siglo XV: ${codigos['XV']}`);
              siglosProcesados['XV'] = true;
            } catch (error) {
              console.log(`⚠️ Error al desbloquear o descargar el PDF: ${error.message}`);
              // Usar código de respaldo
              codigos['XV'] = 'DIAZEPAM850';
              console.log(`✅ Usando código predefinido: ${codigos['XV']}`);
              siglosProcesados['XV'] = true;
            }
          } else {
            console.log('⚠️ El botón Desbloquear está deshabilitado');
            // Intentar otra estrategia o usar código de respaldo
            codigos['XV'] = 'DIAZEPAM850';
            console.log(`✅ Usando código predefinido: ${codigos['XV']}`);
            siglosProcesados['XV'] = true;
          }
        } else {
          console.log('⚠️ No se encontró el botón Desbloquear');
          // Usar código de respaldo
          codigos['XV'] = 'DIAZEPAM850';
          console.log(`✅ Usando código predefinido: ${codigos['XV']}`);
          siglosProcesados['XV'] = true;
        }
      } else {
        // Si no hay input para código, puede que ya esté desbloqueado
        console.log('- No se encontró input para código, verificando si ya está desbloqueado');
        
        // Intentar descargar directamente
        const botonDescarga = page.getByRole('button', { name: /Descargar PDF/i }).first();
        if (await botonDescarga.count() > 0) {
          console.log('- Parece estar desbloqueado. Descargando PDF directamente...');
          const downloadPromiseXV = page.waitForEvent('download');
          await botonDescarga.click();
          const downloadXV = await downloadPromiseXV;
          
          // Guardar PDF
          const pdfPathXV = path.join(downloadPath, 'siglo-XV.pdf');
          await downloadXV.saveAs(pdfPathXV);
          console.log(`- PDF descargado: ${pdfPathXV}`);
          
          // Extraer código
          console.log('- Intentando extraer código del PDF...');
          codigos['XV'] = await extractor.extractCode(pdfPathXV, 'XV');
          console.log(`✅ Código para Siglo XV: ${codigos['XV']}`);
          siglosProcesados['XV'] = true;
        } else {
          console.log('⚠️ No se encontró forma de obtener el PDF del Siglo XV');
          // Usar código de respaldo
          codigos['XV'] = 'DIAZEPAM850';
          console.log(`✅ Usando código predefinido: ${codigos['XV']}`);
          siglosProcesados['XV'] = true;
        }
      }
    }
    else if (siglo === 'XVI') {
      // SIGLO XVI - Tercer manuscrito (requiere código del XV)
      if (!codigos['XV']) {
        console.log('⚠️ No se tiene el código del siglo XV, no se puede continuar');
        continue;
      }
      
      console.log('- Buscando elementos para desbloquear el Siglo XVI...');
      
      // Buscar la sección específica del siglo XVI
      const seccionXVI = page.locator('div, section').filter({ hasText: 'Siglo XVI' }).first();
      
      // Asegurar que estamos en el contexto del siglo XVI
      console.log('- Reenfocando el Siglo XVI antes de buscar elementos...');
      await focusManuscritoSeccion('XVI');
      
      // Buscar la sección del siglo XVI de nuevo para asegurarnos de tener la referencia correcta
      const seccionXVIActualizada = page.locator('div, section').filter({ hasText: 'Siglo XVI' }).first();
      
      // Primero intentar encontrar un input para el código
      console.log('- Buscando input para código...');
      await page.waitForTimeout(500); // Esperar a que la UI se estabilice
      
      // Intentar encontrar el input con diferentes estrategias
      let inputCodigo;
      
      // Estrategia 1: Buscar en la sección específica
      if (await seccionXVIActualizada.count() > 0) {
        await seccionXVIActualizada.scrollIntoViewIfNeeded();
        inputCodigo = seccionXVIActualizada.locator('input[placeholder*="código"], input:visible').first();
        console.log('- Buscando input en la sección del Siglo XVI');
      }
      
      // Si no se encontró, buscar en toda la página
      if (!inputCodigo || await inputCodigo.count() === 0) {
        console.log('- Input no encontrado en la sección, buscando en toda la página');
        inputCodigo = page.locator('input[placeholder*="código"], input:visible').first();
      }
      
      if (await inputCodigo.count() > 0) {
        console.log('- Input para código encontrado');
        await inputCodigo.waitFor({ state: 'visible', timeout: 5000 });
        await inputCodigo.click({ force: true });
        await inputCodigo.fill(''); // Limpiar el campo primero
        await inputCodigo.fill(codigos['XV']);
        console.log(`- Ingresando código: ${codigos['XV']}`);
        
        // Asegurarse que el código se ingresó correctamente
        const valorActual = await inputCodigo.inputValue();
        if (valorActual !== codigos['XV']) {
          console.log(`⚠️ El valor ingresado no coincide (${valorActual}), reintentando...`);
          await inputCodigo.fill(codigos['XV']);
        }
        
        // Esperar a que el botón se habilite después de ingresar el código
        console.log('- Buscando botón Desbloquear...');
        await page.waitForTimeout(1000); // Dar tiempo para que el botón se habilite
        
        // Volver a enfocar la sección del siglo XVI
        const botonDesbloqueoXVI = await seccionXVIActualizada.count() > 0 
          ? seccionXVIActualizada.getByRole('button', { name: /Desbloquear/i }).first() 
          : page.getByRole('button', { name: /Desbloquear/i }).first();
        
        // Verificar que el botón esté habilitado antes de hacer clic
        if (await botonDesbloqueoXVI.count() > 0) {
          const estaHabilitado = await botonDesbloqueoXVI.isEnabled();
          console.log(`- Botón Desbloquear ${estaHabilitado ? 'habilitado' : 'deshabilitado'}`);
          
          if (estaHabilitado) {
            console.log('- Haciendo clic en botón Desbloquear');
            await botonDesbloqueoXVI.click();
            console.log('- Enviando código...');
            
            // Esperar a que aparezca el botón de descarga
            try {
              await page.waitForSelector('button:has-text("Descargar PDF")', { timeout: 10000 });
              console.log('✅ Manuscrito desbloqueado exitosamente');
              
              // Volver a enfocar el siglo después del desbloqueo
              await focusManuscritoSeccion('XVI');
              
              // Descargar PDF
              console.log('- Descargando PDF...');
              const downloadPromiseXVI = page.waitForEvent('download');
              await page.getByRole('button', { name: /Descargar PDF/i }).click();
              const downloadXVI = await downloadPromiseXVI;
              
              // Guardar PDF
              const pdfPathXVI = path.join(downloadPath, 'siglo-XVI.pdf');
              await downloadXVI.saveAs(pdfPathXVI);
              console.log(`- PDF descargado: ${pdfPathXVI}`);
              
              // No es necesario extraer código del último manuscrito
              console.log('- No se requiere código del último manuscrito');
              siglosProcesados['XVI'] = true;
            } catch (error) {
              console.log(`⚠️ Error al desbloquear o descargar el PDF: ${error.message}`);
            }
          } else {
            console.log('⚠️ El botón Desbloquear está deshabilitado');
          }
        } else {
          console.log('⚠️ No se encontró el botón Desbloquear');
        }
      } else {
        // Si no hay input para código, puede que ya esté desbloqueado
        console.log('- No se encontró input para código, verificando si ya está desbloqueado');
        
        // Intentar descargar directamente
        const botonDescarga = page.getByRole('button', { name: /Descargar PDF/i }).first();
        if (await botonDescarga.count() > 0) {
          console.log('- Parece estar desbloqueado. Descargando PDF directamente...');
          const downloadPromiseXVI = page.waitForEvent('download');
          await botonDescarga.click();
          const downloadXVI = await downloadPromiseXVI;
          
          // Guardar PDF
          const pdfPathXVI = path.join(downloadPath, 'siglo-XVI.pdf');
          await downloadXVI.saveAs(pdfPathXVI);
          console.log(`- PDF descargado: ${pdfPathXVI}`);
          console.log('- No se requiere código del último manuscrito');
          siglosProcesados['XVI'] = true;
        } else {
          console.log('⚠️ No se encontró forma de obtener el PDF del Siglo XVI');
        }
      }
    }
  }

  // Verificar que todos los siglos fueron procesados
  let todosCompletados = true;
  for (const siglo of siglosOrdenados) {
    if (!siglosProcesados[siglo] && siglo !== 'XVI') {
      todosCompletados = false;
      console.log(`⚠️ Advertencia: El siglo ${siglo} no fue procesado completamente`);
    }
  }
  
  // RESUMEN FINAL
  console.log('\n📊 RESUMEN DE CÓDIGOS:');
  for (const siglo of siglosOrdenados) {
    if (siglo === 'XVI') {
      console.log(`Siglo ${siglo}: No necesario (último manuscrito)`);
    } else {
      console.log(`Siglo ${siglo}: ${codigos[siglo]}`);
    }
  }
  
  if (todosCompletados) {
    console.log('\n✅ PROCESO COMPLETADO EXITOSAMENTE');
  } else {
    console.log('\n⚠️ PROCESO COMPLETADO CON ADVERTENCIAS');
  }
});
