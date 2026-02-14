/**
 * Gravit Designer Reverse Engineering - Advanced Module Extractor
 * 
 * This script extracts individual webpack modules from the beautified code
 * by searching for class definitions and extracting their complete code.
 * 
 * It finds:
 * - Class definitions via GObject.inherit() and GObject.inheritAndMix()
 * - Prototype method definitions
 * - Static properties and constants
 * 
 * Usage: node extract-all-modules.js
 */

const fs = require('fs-extra');
const path = require('path');

const BEAUTIFIED_DIR = path.join(__dirname, 'beautified');
const OUTPUT_DIR = path.join(__dirname, 'all-modules');

// Load module map
let MODULE_MAP = {};
try {
  MODULE_MAP = require('./extracted-modules/module-map.json');
} catch (e) {
  console.log('Running extract-modules.js first...');
}

// Category mapping
function getCategory(className) {
  if (!className) return 'other';
  
  // Core
  if (['GObject', 'GNode', 'GEvent', 'GEventTarget', 'GLocale', 'GUtil', 'GMath', 'GSystem', 'GLocaleKey', 'GLocaleLanguage'].includes(className)) {
    return 'core';
  }
  
  // Scene
  if (className.match(/Scene|Element|Layer|Page|Group|Block|Item|Symbol|Stylable|Style|Swatch|Background/)) {
    return 'scene';
  }
  
  // Geometry
  if (className.match(/Point|Rect|Transform|Path|Vertex|Shape|Polygon|Ellipse|Rectangle|Compound|Connector|Slice|SimpleShape/)) {
    return 'geometry';
  }
  
  // Effects
  if (className.match(/Effect|Shadow|Blur|Glow|Mirror/)) {
    return 'effects';
  }
  
  // Rendering
  if (className.match(/Paint|Renderer|Canvas|Color|Gradient|Pattern|Bitmap|Image|WebGL|HitResult/)) {
    return 'rendering';
  }
  
  // Text
  if (className.match(/Text|Font|OpenType|TL|Collab/)) {
    return 'text';
  }
  
  // Annotations
  if (className.match(/Annotation|Comment/)) {
    return 'annotations';
  }
  
  return 'other';
}

async function extractAllModules() {
  console.log('📦 Gravit Designer Advanced Module Extractor');
  console.log('=============================================\n');
  
  // Create output directories
  const categories = ['core', 'scene', 'geometry', 'effects', 'rendering', 'text', 'annotations', 'other', 'editor', 'tools'];
  
  for (const cat of categories) {
    await fs.ensureDir(path.join(OUTPUT_DIR, cat));
  }
  
  // Read beautified vendor code
  const vendorPath = path.join(BEAUTIFIED_DIR, 'chunk.vendor.js');
  const designerPath = path.join(BEAUTIFIED_DIR, 'designer.browser.js');
  
  if (!(await fs.pathExists(vendorPath))) {
    console.log('❌ Beautified code not found. Run beautify.js first.');
    return;
  }
  
  const vendorCode = await fs.readFile(vendorPath, 'utf8');
  
  console.log(`📄 Processing vendor bundle (${(vendorCode.length / 1024 / 1024).toFixed(2)} MB)`);
  
  // Find all class definitions
  const classDefinitions = findClassDefinitions(vendorCode);
  console.log(`\n📊 Found ${classDefinitions.length} class definitions\n`);
  
  // Extract each class
  let extracted = 0;
  
  for (const classDef of classDefinitions) {
    const code = extractClassCode(vendorCode, classDef);
    
    if (code && code.length > 100) {
      const category = getCategory(classDef.name);
      const fileName = `${classDef.name}.js`;
      const outputPath = path.join(OUTPUT_DIR, category, fileName);
      
      const header = generateHeader(classDef);
      await fs.writeFile(outputPath, header + code);
      extracted++;
      
      if (extracted % 20 === 0) {
        console.log(`   Extracted ${extracted} classes...`);
      }
    }
  }
  
  console.log(`\n✅ Extracted ${extracted} classes to ${OUTPUT_DIR}/`);
  
  // Now process designer bundle for editor/UI classes
  if (await fs.pathExists(designerPath)) {
    console.log('\n📄 Processing designer bundle...');
    const designerCode = await fs.readFile(designerPath, 'utf8');
    
    const editorClasses = findClassDefinitions(designerCode);
    console.log(`📊 Found ${editorClasses.length} class definitions in designer\n`);
    
    let editorExtracted = 0;
    
    for (const classDef of editorClasses) {
      const code = extractClassCode(designerCode, classDef);
      
      if (code && code.length > 100) {
        let category = 'editor';
        if (classDef.name.includes('Tool')) category = 'tools';
        
        const fileName = `${classDef.name}.js`;
        const outputPath = path.join(OUTPUT_DIR, category, fileName);
        
        // Skip if already extracted from vendor
        if (await fs.pathExists(path.join(OUTPUT_DIR, getCategory(classDef.name), fileName))) {
          continue;
        }
        
        const header = generateHeader(classDef);
        await fs.writeFile(outputPath, header + code);
        editorExtracted++;
      }
    }
    
    console.log(`✅ Extracted ${editorExtracted} editor/UI classes`);
  }
  
  // Create index
  await createIndex(OUTPUT_DIR);
  
  console.log('\n📁 Output structure:');
  for (const cat of categories) {
    const catPath = path.join(OUTPUT_DIR, cat);
    if (await fs.pathExists(catPath)) {
      const files = await fs.readdir(catPath);
      if (files.length > 0) {
        console.log(`   ${cat}/  - ${files.length} files`);
      }
    }
  }
}

function findClassDefinitions(code) {
  const definitions = [];
  
  // Pattern 1: GObject.inherit(ClassName, ParentClass)
  const inheritPattern = /GObject\.inherit\(\s*(\w+)\s*,\s*(\w+)/g;
  let match;
  
  while ((match = inheritPattern.exec(code)) !== null) {
    const [, className, parentClass] = match;
    if (className.startsWith('G') || className.match(/^[A-Z][a-z]/)) {
      definitions.push({
        name: className,
        parent: parentClass,
        type: 'inherit',
        position: match.index
      });
    }
  }
  
  // Pattern 2: GObject.inheritAndMix(ClassName, ParentClass, [Mixins])
  const mixPattern = /GObject\.inheritAndMix\(\s*(\w+)\s*,\s*(\w+|null)\s*,\s*\[([^\]]*)\]/g;
  
  while ((match = mixPattern.exec(code)) !== null) {
    const [, className, parentClass, mixins] = match;
    if (className.startsWith('G') || className.match(/^[A-Z][a-z]/)) {
      definitions.push({
        name: className,
        parent: parentClass !== 'null' ? parentClass : null,
        mixins: mixins.split(',').map(m => m.trim()).filter(Boolean),
        type: 'inheritAndMix',
        position: match.index
      });
    }
  }
  
  // Pattern 3: function ClassName() {} (constructor pattern)
  const constructorPattern = /function\s+(G\w+)\s*\(\s*\)\s*\{/g;
  
  while ((match = constructorPattern.exec(code)) !== null) {
    const [, className] = match;
    // Check if not already found
    if (!definitions.find(d => d.name === className)) {
      definitions.push({
        name: className,
        type: 'constructor',
        position: match.index
      });
    }
  }
  
  // Remove duplicates and sort by position
  const uniqueDefs = [];
  const seen = new Set();
  
  for (const def of definitions.sort((a, b) => a.position - b.position)) {
    if (!seen.has(def.name)) {
      seen.add(def.name);
      uniqueDefs.push(def);
    }
  }
  
  return uniqueDefs;
}

function extractClassCode(code, classDef) {
  const name = classDef.name;
  
  // Find all code related to this class
  const segments = [];
  
  // 1. Find constructor function
  const constructorPattern = new RegExp(
    `function\\s+${name}\\s*\\([^)]*\\)\\s*\\{[^}]*\\}`,
    'g'
  );
  let match = constructorPattern.exec(code);
  if (match) {
    segments.push({ pos: match.index, code: match[0] });
  }
  
  // 2. Find inheritance call
  const inheritPattern = new RegExp(
    `GObject\\.(?:inherit|inheritAndMix)\\(\\s*${name}[^)]*\\)`,
    'g'
  );
  match = inheritPattern.exec(code);
  if (match) {
    segments.push({ pos: match.index, code: match[0] });
  }
  
  // 3. Find all prototype methods
  const prototypePattern = new RegExp(
    `${name}\\.prototype\\.(\\w+)\\s*=\\s*function\\s*\\([^)]*\\)\\s*\\{`,
    'g'
  );
  
  while ((match = prototypePattern.exec(code)) !== null) {
    // Extract full function body
    const funcBody = extractFunctionBody(code, match.index + match[0].length);
    segments.push({
      pos: match.index,
      code: match[0] + funcBody + '}'
    });
  }
  
  // 4. Find all static properties
  const staticPattern = new RegExp(
    `${name}\\.(\\w+)\\s*=\\s*(?:[^;]+);`,
    'g'
  );
  
  while ((match = staticPattern.exec(code)) !== null) {
    // Skip prototype assignment
    if (match[1] === 'prototype') continue;
    
    segments.push({
      pos: match.index,
      code: match[0]
    });
  }
  
  // Sort by position and combine
  segments.sort((a, b) => a.pos - b.pos);
  
  if (segments.length === 0) {
    return null;
  }
  
  return segments.map(s => s.code).join('\n\n');
}

function extractFunctionBody(code, startIndex) {
  let depth = 1;
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
    
    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
    }
    
    i++;
  }
  
  return code.slice(startIndex, i - 1);
}

function generateHeader(classDef) {
  let header = `/**
 * ${classDef.name}
 * 
 * Extracted from Gravit Designer minified source
 * 
`;

  if (classDef.parent) {
    header += ` * Extends: ${classDef.parent}\n`;
  }
  
  if (classDef.mixins && classDef.mixins.length > 0) {
    header += ` * Mixins: ${classDef.mixins.join(', ')}\n`;
  }
  
  header += ` * 
 * Note: Variable names are minified. Refer to the original open-source
 * Gravit code for context on what each variable represents.
 */

`;
  
  return header;
}

async function createIndex(outputDir) {
  const categories = ['core', 'scene', 'geometry', 'effects', 'rendering', 'text', 'annotations', 'editor', 'tools', 'other'];
  
  let indexContent = `/**
 * Gravit Designer - Extracted Modules Index
 * 
 * This module provides access to all extracted classes.
 */

const modules = {
`;

  for (const cat of categories) {
    const catPath = path.join(outputDir, cat);
    if (!(await fs.pathExists(catPath))) continue;
    
    const files = await fs.readdir(catPath);
    if (files.length === 0) continue;
    
    indexContent += `  // ${cat.toUpperCase()}\n`;
    
    for (const file of files.sort()) {
      if (!file.endsWith('.js')) continue;
      const className = file.replace('.js', '');
      indexContent += `  ${className}: require('./${cat}/${file}'),\n`;
    }
    
    indexContent += '\n';
  }
  
  indexContent += `};

module.exports = modules;
`;

  await fs.writeFile(path.join(outputDir, 'index.js'), indexContent);
  console.log('✅ Created index.js');
}

extractAllModules().catch(console.error);
