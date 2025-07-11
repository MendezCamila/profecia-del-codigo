import { test, expect } from '@playwright/test';

test('Login simple en portal de prueba técnica', async ({ page }) => {
  // Aumentar timeout para este test específico
  test.setTimeout(60000);
  
  console.log('Iniciando prueba de login simple...');
  
  // 1. Navegar a la página de login
  console.log('Navegando a la página de login...');
  await page.goto('https://pruebatecnica-sherpa-production.up.railway.app/login', { 
    waitUntil: 'domcontentloaded', 
    timeout: 30000 
  });
  
  
  
  // 2. Inspeccionar la estructura de la página antes de interactuar
  console.log('Capturando estructura del formulario...');
  const formStructure = await page.evaluate(() => {
    // Encontrar formularios
    const forms = Array.from(document.querySelectorAll('form'));
    
    // Encontrar campos de entrada y botones
    const inputs = Array.from(document.querySelectorAll('input, button'));
    
    return {
      forms: forms.map(f => ({
        action: f.getAttribute('action'),
        method: f.getAttribute('method'),
        id: f.getAttribute('id'),
        className: f.getAttribute('class')
      })),
      inputs: inputs.map(input => ({
        type: input.getAttribute('type'),
        id: input.getAttribute('id'),
        name: input.getAttribute('name'),
        placeholder: input.getAttribute('placeholder'),
        value: input.getAttribute('value'),
        tagName: input.tagName
      }))
    };
  });
  
  console.log('Estructura del formulario:', JSON.stringify(formStructure, null, 2));
  
  // 3. Completar el email basado en la estructura detectada
  console.log('Completando campo de email...');
  await page.locator('input[type="email"], input[name="email"], input#email, input[placeholder*="email" i]')
    .first()
    .fill('monje@sherpa.local');
  
  // 4. Completar la contraseña
  console.log('Completando campo de contraseña...');
  await page.locator('input[type="password"], input[name="password"], input#password')
    .first()
    .fill('cript@123');
  
  // 5. Hacer clic en el botón de login
  console.log('Haciendo clic en botón de login...');
  const loginButton = await page.locator('button[type="submit"], input[type="submit"], button').first();
  await loginButton.click();
  
  // 6. Esperar a que se complete la navegación o carga
  console.log('Esperando resultado del login...');
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => 
    console.log('Timeout esperando networkidle, continuando de todos modos'));
  
  // 7. Tomar screenshot después del login
  console.log('Guardando screenshot del resultado...');
  await page.screenshot({ path: 'post-login-simple.png' });
  
  // 8. Verificar el resultado obteniendo la URL actual
  const currentUrl = page.url();
  console.log('URL después del login:', currentUrl);
  
  console.log('Prueba de login simple completada');
});
