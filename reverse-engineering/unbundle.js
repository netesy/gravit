/**
 * Gravit Designer Reverse Engineering - Webpack Unbundler
 * 
 * Extracts individual webpack modules from the bundled files
 * and saves them as separate files with meaningful names.
 * 
 * Usage: node unbundle.js
 */

const fs = require('fs-extra');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_DIR = path.join(__dirname, 'modules');

// Load module map
const MODULE_MAP = require('./extracted-modules/module-map.json');

async function unbundle() {
  console.log('📦 Gravit Designer Webpack Unbundler');
  console.log('====================================\n');
  
  await fs.ensureDir(OUTPUT_DIR);
  await fs.ensureDir(path.join(OUTPUT_DIR, 'core'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'scene'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'effects'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'annotations'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'geometry'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'rendering'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'text'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'other'));
  
  const vendorPath = path.join(PUBLIC_DIR, 'chunk.vendor.js');
  const vendorCode = await fs.readFile(vendorPath, 'utf8');
  
  console.log(`📄 Reading vendor bundle (${(vendorCode.length / 1024 / 1024).toFixed(2)} MB)`);
  
  // Parse the webpack bundle structure
  // The bundle looks like: (this.webpackJsonpGravitDesigner = ...).push([[0], [module0, module1, ...], {...}])
  
  // Find the modules array
  const modulesMatch = vendorCode.match(/\.push\s*\(\s*\[\s*\[\s*\d+\s*\]\s*,\s*\[/);
  if (!modulesMatch) {
    console.log('❌ Could not find webpack modules array');
    return;
  }
  
  const startIndex = modulesMatch.index + modulesMatch[0].length;
  
  // Extract modules by finding function boundaries
  const modules = extractModules(vendorCode, startIndex);
  
  console.log(`\n📊 Extracted ${modules.length} modules`);
  
  // Save each module
  let savedCount = 0;
  for (let i = 0; i < modules.length; i++) {
    const moduleCode = modules[i];
    if (!moduleCode || moduleCode.trim() === '') continue;
    
    const className = MODULE_MAP[i];
    const category = getCategory(className);
    const fileName = className ? `${i}-${className}.js` : `${i}-unknown.js`;
    const outputPath = path.join(OUTPUT_DIR, category, fileName);
    
    // Add header comment
    const header = `/**
 * Module ${i}${className ? ` - ${className}` : ''}
 * Extracted from chunk.vendor.js
 * 
 * Original: Gravit Designer by Corel
 * Reverse engineered for educational purposes
 */

`;
    
    await fs.writeFile(outputPath, header + formatModule(moduleCode));
    savedCount++;
  }
  
  console.log(`✅ Saved ${savedCount} modules to ${OUTPUT_DIR}/`);
  
  // Create index file
  const indexContent = generateIndex(modules);
  await fs.writeFile(path.join(OUTPUT_DIR, 'index.js'), indexContent);
  console.log(`✅ Created index.js`);
  
  console.log('\n💡 Module organization:');
  console.log('   core/      - Base classes (GObject, GNode, GEvent)');
  console.log('   scene/     - Scene graph (GScene, GElement, GLayer)');
  console.log('   geometry/  - Geometry (GPoint, GRect, GTransform, GPath)');
  console.log('   effects/   - Visual effects (blur, shadow, etc.)');
  console.log('   rendering/ - Rendering (GPaintCanvas, GRenderer)');
  console.log('   text/      - Text handling (GText, GFont)');
  console.log('   annotations/ - Annotations');
  console.log('   other/     - Uncategorized modules');
}

function extractModules(code, startIndex) {
  const modules = [];
  let depth = 1; // We're inside the array
  let moduleStart = startIndex;
  let i = startIndex;
  let inString = false;
  let stringChar = '';
  let escaped = false;
  
  while (i < code.length && depth > 0) {
    const char = code[i];
    
    if (escaped) {
      escaped = false;
      i++;
      continue;
    }
    
    if (char === '\\') {
      escaped = true;
      i++;
      continue;
    }
    
    if (inString) {
      if (char === stringChar) {
        inString = false;
      }
      i++;
      continue;
    }
    
    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      stringChar = char;
      i++;
      continue;
    }
    
    if (char === '[' || char === '{' || char === '(') {
      depth++;
    } else if (char === ']' || char === '}' || char === ')') {
      depth--;
      if (depth === 0) break;
    } else if (char === ',' && depth === 1) {
      // Module boundary
      modules.push(code.slice(moduleStart, i));
      moduleStart = i + 1;
    }
    
    i++;
  }
  
  // Last module
  if (moduleStart < i) {
    modules.push(code.slice(moduleStart, i));
  }
  
  return modules;
}

function getCategory(className) {
  if (!className) return 'other';
  
  // Core
  if (['GObject', 'GNode', 'GEvent', 'GEventTarget', 'GLocale', 'GUtil', 'GMath', 'GSystem', 'GLocaleKey', 'GLocaleLanguage'].includes(className)) {
    return 'core';
  }
  
  // Scene
  if (className.includes('Scene') || className.includes('Element') || className.includes('Layer') || 
      className.includes('Page') || className.includes('Group') || className.includes('Block') ||
      className.includes('Item') || className.includes('Symbol') || className.includes('Stylable') ||
      className.includes('Style') || className.includes('Swatch')) {
    return 'scene';
  }
  
  // Geometry
  if (className.includes('Point') || className.includes('Rect') || className.includes('Transform') ||
      className.includes('Path') || className.includes('Vertex') || className.includes('Shape') ||
      className.includes('Polygon') || className.includes('Ellipse') || className.includes('Rectangle') ||
      className.includes('Compound') || className.includes('Connector') || className.includes('Slice')) {
    return 'geometry';
  }
  
  // Effects
  if (className.includes('Effect') || className.includes('Shadow') || className.includes('Blur') ||
      className.includes('Glow') || className.includes('Mirror')) {
    return 'effects';
  }
  
  // Rendering
  if (className.includes('Paint') || className.includes('Renderer') || className.includes('Canvas') ||
      className.includes('Color') || className.includes('Gradient') || className.includes('Pattern') ||
      className.includes('Bitmap') || className.includes('Image') || className.includes('WebGL') ||
      className.includes('HitResult')) {
    return 'rendering';
  }
  
  // Text
  if (className.includes('Text') || className.includes('Font') || className.includes('OpenType') ||
      className.includes('TL') || className.includes('Collab')) {
    return 'text';
  }
  
  // Annotations
  if (className.includes('Annotation') || className.includes('Comment')) {
    return 'annotations';
  }
  
  return 'other';
}

function formatModule(code) {
  // Basic formatting
  code = code.trim();
  
  // Remove leading/trailing function wrapper if present
  if (code.startsWith('function')) {
    // Keep it - it's a module function
  }
  
  return code;
}

function generateIndex(modules) {
  let content = `/**
 * Gravit Designer - Extracted Modules Index
 * 
 * This file maps module IDs to their class names
 * for easier navigation and understanding.
 */

const MODULE_MAP = {
`;
  
  for (const [id, name] of Object.entries(MODULE_MAP)) {
    content += `  ${id}: '${name}',\n`;
  }
  
  content += `};

module.exports = MODULE_MAP;
`;
  
  return content;
}

unbundle().catch(console.error);
