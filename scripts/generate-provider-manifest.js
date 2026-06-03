#!/usr/bin/env node

/**
 * Generate provider manifest from SVG and PNG files.
 * This script reads all icon files and creates a manifest.json
 * that maps each icon ID to its available variants and formats.
 */

const fs = require('fs');
const path = require('path');

const PROVIDERS_DIR = path.join(__dirname, '..', 'public', 'providers');
const OUTPUT_FILE = path.join(PROVIDERS_DIR, 'manifest.json');

// Variant suffixes in order of preference
const VARIANT_SUFFIXES = ['-brand-color', '-text-cn', '-color', '-text', '-brand', ''];

function generateManifest() {
  // Read SVG files
  const svgFiles = fs.readdirSync(PROVIDERS_DIR)
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace('.svg', ''));

  // Read PNG Light files
  const lightDir = path.join(PROVIDERS_DIR, 'light');
  const lightFiles = fs.existsSync(lightDir)
    ? fs.readdirSync(lightDir).filter(f => f.endsWith('.png')).map(f => f.replace('.png', ''))
    : [];

  // Read PNG Dark files
  const darkDir = path.join(PROVIDERS_DIR, 'dark');
  const darkFiles = fs.existsSync(darkDir)
    ? fs.readdirSync(darkDir).filter(f => f.endsWith('.png')).map(f => f.replace('.png', ''))
    : [];

  // Parse each file into id and variant
  const parseFile = (name) => {
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
  };

  // Build icon map
  const iconMap = new Map();

  // Process SVGs
  for (const name of svgFiles) {
    const { id, variant } = parseFile(name);
    if (!iconMap.has(id)) iconMap.set(id, { id, variants: new Set(), formats: { svg: new Set(), png_light: new Set(), png_dark: new Set() } });
    iconMap.get(id).variants.add(variant);
    iconMap.get(id).formats.svg.add(variant);
  }

  // Process PNG Light
  for (const name of lightFiles) {
    const { id, variant } = parseFile(name);
    if (!iconMap.has(id)) iconMap.set(id, { id, variants: new Set(), formats: { svg: new Set(), png_light: new Set(), png_dark: new Set() } });
    iconMap.get(id).variants.add(variant);
    iconMap.get(id).formats.png_light.add(variant);
  }

  // Process PNG Dark
  for (const name of darkFiles) {
    const { id, variant } = parseFile(name);
    if (!iconMap.has(id)) iconMap.set(id, { id, variants: new Set(), formats: { svg: new Set(), png_light: new Set(), png_dark: new Set() } });
    iconMap.get(id).variants.add(variant);
    iconMap.get(id).formats.png_dark.add(variant);
  }

  // Convert to manifest array
  const sortOrder = ['', '-color', '-text', '-text-cn', '-brand', '-brand-color'];
  const manifest = [...iconMap.values()].map(icon => ({
    id: icon.id,
    variants: [...icon.variants].sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b)),
    formats: {
      svg: [...icon.formats.svg].sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b)),
      png_light: [...icon.formats.png_light].sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b)),
      png_dark: [...icon.formats.png_dark].sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b)),
    }
  })).sort((a, b) => a.id.localeCompare(b.id));

  // Write manifest
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

  // Stats
  const totalSvg = svgFiles.length;
  const totalPngLight = lightFiles.length;
  const totalPngDark = darkFiles.length;
  console.log(`Generated manifest:`);
  console.log(`  Icons: ${manifest.length}`);
  console.log(`  SVGs: ${totalSvg}`);
  console.log(`  PNG Light: ${totalPngLight}`);
  console.log(`  PNG Dark: ${totalPngDark}`);
  console.log(`  Total files: ${totalSvg + totalPngLight + totalPngDark}`);
}

generateManifest();
