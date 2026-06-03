#!/usr/bin/env node

/**
 * Generate provider manifest from SVG files in public/providers/
 * This script reads all SVG files and creates a manifest.json
 * that maps each icon ID to its available variants.
 */

const fs = require('fs');
const path = require('path');

const PROVIDERS_DIR = path.join(__dirname, '..', 'public', 'providers');
const OUTPUT_FILE = path.join(PROVIDERS_DIR, 'manifest.json');

// Variant suffixes in order of preference
const VARIANT_SUFFIXES = ['-brand-color', '-text-cn', '-color', '-text', '-brand', ''];

function generateManifest() {
  const files = fs.readdirSync(PROVIDERS_DIR)
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace('.svg', ''));

  // Parse each file into id and variant
  const icons = files.map(name => {
    let id = name;
    let variant = '';

    for (const suffix of VARIANT_SUFFIXES) {
      if (suffix && name.endsWith(suffix)) {
        id = name.slice(0, -suffix.length);
        variant = suffix;
        break;
      }
    }

    return { id, variant };
  });

  // Group by id
  const grouped = {};
  for (const icon of icons) {
    if (!grouped[icon.id]) {
      grouped[icon.id] = { id: icon.id, variants: [] };
    }
    grouped[icon.id].variants.push(icon.variant);
  }

  // Sort variants consistently
  const sortOrder = ['', '-color', '-text', '-text-cn', '-brand', '-brand-color'];
  for (const g of Object.values(grouped)) {
    g.variants.sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b));
  }

  // Sort by id
  const manifest = Object.values(grouped).sort((a, b) => a.id.localeCompare(b.id));

  // Write manifest
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  console.log(`Generated manifest: ${manifest.length} icons, ${files.length} total files`);
}

generateManifest();
