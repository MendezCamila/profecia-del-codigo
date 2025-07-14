#!/usr/bin/env node

// Script para ejecutar las pruebas ignorando errores de TypeScript
const { spawn } = require('child_process');
const path = require('path');

console.log('Ejecutando pruebas ignorando errores de TypeScript...');

const jestProcess = spawn('npx', [
  'jest',
  '--testMatch=**/__tests__/**/*.test.ts',
  '--no-cache',
  '--verbose',
  '--testTimeout=30000',
  '--forceExit'
], {
  stdio: 'inherit',
  shell: true
});

jestProcess.on('exit', (code) => {
  console.log(`Jest terminó con código: ${code}`);
  process.exit(code);
});
