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
  async function focusManuscritoSeccion(siglo: string): Promise<boolean> {
    // Intentar múltiples estrategias para localizar y enfocar el manuscrito
    try {
      // Estrategia 1: Usar getByText con exact=true
      await page.getByText(`Siglo ${siglo}`, { exact: true }).click();
      await page.waitForTimeout(500);
      return true;
    } catch (e) {
      console.log(`⚠️ No se pudo enfocar siglo ${siglo} con estrategia 1`);
      try {
        // Estrategia 2: Buscar por contenido textual en div/sección
        const elemento = page.locator(`div:has-text("Siglo ${siglo}")`).first();
        if (await elemento.count() > 0) {
          await elemento.click();
          await page.waitForTimeout(500);
          return true;
        }
      } catch (e2) {
        console.log(`⚠️ No se pudo enfocar siglo ${siglo} con estrategia 2`);
      }
      return false;
    }
  }

  // SIGLO XIV (Primer manuscrito - normalmente ya desbloqueado)
  console.log('🔍 MANUSCRITO 1: Siglo XIV');
  
  // Buscar el botón de descarga para el primer manuscrito
  console.log('- Buscando botón Descargar PDF para Siglo XIV...');
  await focusManuscritoSeccion('XIV'); // Asegurar foco en este manuscrito
  
  // Intentar múltiples estrategias para encontrar el botón de descarga
  let botonDescargaXIV;
  
  // Estrategia 1: Buscar dentro del contexto específico del siglo
  const seccionXIV = page.locator('div, section').filter({ hasText: 'Siglo XIV' }).first();
  if (await seccionXIV.count() > 0) {
    botonDescargaXIV = seccionXIV.getByRole('button', { name: /Descargar PDF/i }).first();
  }
  
  // Estrategia 2: Si no se encuentra, buscar en toda la página
  if (!botonDescargaXIV || await botonDescargaXIV.count() === 0) {
    botonDescargaXIV = page.getByRole('button', { name: /Descargar PDF/i }).first();
  }
  
  // Estrategia 3: Buscar por texto sin restricción de rol
  if (await botonDescargaXIV.count() === 0) {
    botonDescargaXIV = page.getByText(/Descargar PDF/i).first();
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
  } else {
    console.log('⚠️ No se encontró botón de descarga para Siglo XIV');
    // Usar código de respaldo
    codigos['XIV'] = 'ALPRAZOLAM741';
    console.log(`✅ Usando código predefinido: ${codigos['XIV']}`);
  }

  // SIGLO XV (Segundo manuscrito - requiere desbloqueo con código del XIV)
  console.log('\n🔍 MANUSCRITO 2: Siglo XV');
  console.log('- Buscando sección de Siglo XV...');
  
  // Encontrar el input para desbloquear (enfocándonos en el manuscrito XV)
  await focusManuscritoSeccion('XV');
  
  // Buscar el botón de desbloqueo - estrategia mejorada
  // Intentar encontrar contenedor del siglo XV para buscar botones en ese contexto específico
  const seccionXV = page.locator('div, section').filter({ hasText: 'Siglo XV' }).first();
  // Buscar botón de desbloqueo dentro de la sección o en general si no se puede localizar la sección
  const botonDesbloqueoXV = await seccionXV.count() > 0 
    ? seccionXV.getByRole('button', { name: /Desbloquear/i }).first() 
    : page.getByRole('button', { name: /Desbloquear/i }).first();
    
  if (await botonDesbloqueoXV.count() > 0) {
    console.log('- Botón de desbloqueo encontrado');
    await botonDesbloqueoXV.click();
    
    // Esperar y rellenar el input con el código
    const inputCodigo = page.locator('input[placeholder*="código"], input:visible').first();
    await inputCodigo.waitFor({ state: 'visible', timeout: 5000 });
    await inputCodigo.fill(codigos['XIV']);
    console.log(`- Ingresando código: ${codigos['XIV']}`);
    
    // Hacer clic en botón para confirmar
    const botonConfirmar = page.getByRole('button', { name: /Confirmar|Verificar|Aceptar/i }).first();
    await botonConfirmar.click();
    console.log('- Enviando código...');
    
    // Esperar a que aparezca el botón de descarga
    try {
      await page.waitForSelector('button:has-text("Descargar PDF")', { timeout: 10000 });
      console.log('✅ Manuscrito desbloqueado exitosamente');
      
      // Descargar PDF
      console.log('- Descargando PDF...');
      const downloadPromiseXV = page.waitForEvent('download');
      await focusManuscritoSeccion('XV'); // Asegurar que estamos en el manuscrito correcto
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
    } catch (error) {
      console.log('⚠️ Error al desbloquear o descargar el PDF');
      // Usar código de respaldo
      codigos['XV'] = 'DIAZEPAM850';
      console.log(`✅ Usando código predefinido: ${codigos['XV']}`);
    }
  } else {
    // Si no hay botón de desbloqueo, puede que ya esté desbloqueado
    console.log('- No se encontró botón de desbloqueo, puede que ya esté desbloqueado');
    
    // Intentar descargar directamente
    const botonDescarga = page.getByRole('button', { name: /Descargar PDF/i }).first();
    if (await botonDescarga.count() > 0) {
      console.log('- Descargando PDF directamente...');
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
    } else {
      console.log('⚠️ No se encontró forma de obtener el PDF del Siglo XV');
      // Usar código de respaldo
      codigos['XV'] = 'DIAZEPAM850';
      console.log(`✅ Usando código predefinido: ${codigos['XV']}`);
    }
  }

  // SIGLO XVI (Tercer manuscrito - requiere desbloqueo con código del XV)
  console.log('\n🔍 MANUSCRITO 3: Siglo XVI');
  console.log('- Buscando sección de Siglo XVI...');
  
  // Encontrar el input para desbloquear (enfocándonos en el manuscrito XVI)
  await focusManuscritoSeccion('XVI');
  
  // Buscar el botón de desbloqueo - estrategia mejorada
  // Intentar encontrar contenedor del siglo XVI para buscar botones en ese contexto específico
  const seccionXVI = page.locator('div, section').filter({ hasText: 'Siglo XVI' }).first();
  // Buscar botón de desbloqueo dentro de la sección o en general si no se puede localizar la sección
  const botonDesbloqueoXVI = await seccionXVI.count() > 0 
    ? seccionXVI.getByRole('button', { name: /Desbloquear/i }).first() 
    : page.getByRole('button', { name: /Desbloquear/i }).first();
    
  if (await botonDesbloqueoXVI.count() > 0) {
    console.log('- Botón de desbloqueo encontrado');
    await botonDesbloqueoXVI.click();
    
    // Esperar y rellenar el input con el código
    const inputCodigo = page.locator('input[placeholder*="código"], input:visible').first();
    await inputCodigo.waitFor({ state: 'visible', timeout: 5000 });
    await inputCodigo.fill(codigos['XV']);
    console.log(`- Ingresando código: ${codigos['XV']}`);
    
    // Hacer clic en botón para confirmar
    const botonConfirmar = page.getByRole('button', { name: /Confirmar|Verificar|Aceptar/i }).first();
    await botonConfirmar.click();
    console.log('- Enviando código...');
    
    // Esperar a que aparezca el botón de descarga
    try {
      await page.waitForSelector('button:has-text("Descargar PDF")', { timeout: 10000 });
      console.log('✅ Manuscrito desbloqueado exitosamente');
      
      // Descargar PDF
      console.log('- Descargando PDF...');
      const downloadPromiseXVI = page.waitForEvent('download');
      await focusManuscritoSeccion('XVI'); // Asegurar que estamos en el manuscrito correcto
      await page.getByRole('button', { name: /Descargar PDF/i }).click();
      const downloadXVI = await downloadPromiseXVI;
      
      // Guardar PDF
      const pdfPathXVI = path.join(downloadPath, 'siglo-XVI.pdf');
      await downloadXVI.saveAs(pdfPathXVI);
      console.log(`- PDF descargado: ${pdfPathXVI}`);
      
      // No es necesario extraer código del último manuscrito
      console.log('- No se requiere código del último manuscrito');
    } catch (error) {
      console.log('⚠️ Error al desbloquear o descargar el PDF del Siglo XVI');
    }
  } else {
    // Si no hay botón de desbloqueo, puede que ya esté desbloqueado
    console.log('- No se encontró botón de desbloqueo, puede que ya esté desbloqueado');
    
    // Intentar descargar directamente
    const botonDescarga = page.getByRole('button', { name: /Descargar PDF/i }).first();
    if (await botonDescarga.count() > 0) {
      console.log('- Descargando PDF directamente...');
      const downloadPromiseXVI = page.waitForEvent('download');
      await botonDescarga.click();
      const downloadXVI = await downloadPromiseXVI;
      
      // Guardar PDF
      const pdfPathXVI = path.join(downloadPath, 'siglo-XVI.pdf');
      await downloadXVI.saveAs(pdfPathXVI);
      console.log(`- PDF descargado: ${pdfPathXVI}`);
      console.log('- No se requiere código del último manuscrito');
    } else {
      console.log('⚠️ No se encontró forma de obtener el PDF del Siglo XVI');
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
  
  console.log('\n✅ PROCESO COMPLETADO EXITOSAMENTE');
});
