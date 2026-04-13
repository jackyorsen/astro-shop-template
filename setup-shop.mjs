#!/usr/bin/env node

/**
 * Setup Script für neue Shops basierend auf dem Astro Shop Template
 * 
 * Usage: node setup-shop.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Astro Shop Template Setup\n');

// Load shop config
const configPath = path.join(__dirname, 'shop.config.json');
if (!fs.existsSync(configPath)) {
  console.error('❌ shop.config.json nicht gefunden!');
  console.log('Bitte erstelle zuerst eine shop.config.json Datei.');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

console.log(`📝 Konfiguriere Shop: ${config.shop.name}\n`);

// Helper: Replace in file
function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Datei nicht gefunden: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  
  for (const [search, replace] of Object.entries(replacements)) {
    content = content.replace(new RegExp(search, 'g'), replace);
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ ${path.basename(filePath)} aktualisiert`);
}

// 1. Update package.json
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  packageJson.name = config.shop.name.toLowerCase().replace(/\s+/g, '-');
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
  console.log('✅ package.json aktualisiert');
}

// 2. Update Footer
const footerPath = path.join(__dirname, 'src/components/Footer.tsx');
replaceInFile(footerPath, {
  'Mamoru Möbel': config.shop.name,
  'MAMORU GmbH': config.company.legalName,
  'Rathausplatz 3': config.company.address.street,
  '8853 Lachen, Schweiz': `${config.company.address.zip} ${config.company.address.city}, ${config.company.address.country}`,
  'aureliusherrscher@gmail.com': config.company.contact.email,
  '\+41 76 200 46 78': config.company.contact.phone,
  'Mo-Fr: 9:00 - 18:00 Uhr<br />Sa: 10:00 - 16:00 Uhr': config.company.contact.hours.replace('\n', '<br />')
});

// 3. Update Header
const headerPath = path.join(__dirname, 'src/components/Header.tsx');
replaceInFile(headerPath, {
  'Mamoru Möbel': config.shop.name,
  'MAMORU': config.shop.shortName,
  '/logo-mamoru.png': config.shop.logo
});

// 4. Check .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n⚠️  .env Datei fehlt!');
  console.log('Kopiere .env.example nach .env und fülle deine Credentials ein:');
  console.log('  cp .env.example .env');
}

// 5. Create empty products.json if not exists
const productsPath = path.join(__dirname, 'public/products.json');
if (!fs.existsSync(productsPath)) {
  fs.writeFileSync(productsPath, '[]', 'utf-8');
  console.log('✅ Leere products.json erstellt');
}

console.log('\n✨ Setup abgeschlossen!\n');
console.log('Nächste Schritte:');
console.log('1. Logo anpassen: ' + config.shop.logo);
console.log('2. .env konfigurieren (Firebase, Stripe)');
console.log('3. Produkte in public/products.json eintragen');
console.log('4. npm install && npm run dev\n');
