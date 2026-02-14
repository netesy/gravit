/**
 * Gravit Designer - Reconstruct Source from Class Map
 * 
 * Extracts classes using positions from class-map.json
 * and reconstructs readable source code.
 * 
 * Usage: node reconstruct-from-map.js
 */

const fs = require('fs-extra');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const BEAUTIFIED_DIR = path.join(__dirname, 'beautified');
const ORIGINAL_DIR = path.join(__dirname, '..', '..', 'gravit-original', 'src');
const OUTPUT_DIR = path.join(__dirname, 'reconstructed');

// Load class map
const classMap = require('./analysis/class-map.json');
const moduleMap = require('./extracted-modules/module-map.json');

// Category organization
function getCategory(className) {
  if (!className) return 'other';
  
  // Core
  if (['GObject', 'GNode', 'GEvent', 'GEventTarget', 'GLocale', 'GUtil', 'GMath', 'GSystem', 'GLocaleKey', 'GLocaleLanguage', 'GActionable', 'GTransactionRecorder', 'GDictionary', 'GDate', 'GLength'].includes(className)) {
    return 'infinity/core';
  }
  
  // Scene structures
  if (className.match(/Scene|Element|Layer|Page|Group|Block|Item|Symbol|Stylable|Style|Swatch|Background|Workspace|Annotable/)) {
    return 'infinity/scene';
  }
  
  // Geometry/Shapes
  if (className.match(/Path|Vertex|Shape|Polygon|Ellipse|Rectangle|Compound|Connector|Slice|SimpleShape/)) {
    return 'infinity/vertex';
  }
  
  // Transforms and points
  if (className.match(/Point|Rect|Transform|HitResult/)) {
    return 'infinity/geometry';
  }
  
  // Effects
  if (className.match(/Effect|Shadow|Blur|Glow|Mirror|Multi/)) {
    return 'infinity/effects';
  }
  
  // Rendering
  if (className.match(/Paint|Renderer|Canvas|Color|Gradient|Pattern|Bitmap|Image|WebGL/)) {
    return 'infinity/paint';
  }
  
  // Text
  if (className.match(/Text|Font|OpenType|TL|Collab/)) {
    return 'infinity/other';
  }
  
  // Annotations
  if (className.match(/Annotation|Comment/)) {
    return 'infinity/other';
  }
  
  // Editor
  if (className.match(/Editor|Guide|Tool/)) {
    return 'editor';
  }
  
  return 'infinity/other';
}

async function loadOriginalSourcePatterns() {
  const patterns = {};
  
  const infinityDir = path.join(ORIGINAL_DIR, 'infinity');
  if (!(await fs.pathExists(infinityDir))) {
    return patterns;
  }
  
  // Read all original source files
  const files = await getAllJsFiles(infinityDir);
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const relativePath = path.relative(ORIGINAL_DIR, file);
    
    // Extract class name from file
    const classMatch = content.match(/function\s+(IF\w+|G\w+)\s*\(/);
    if (classMatch) {
      const className = classMatch[1];
      // Convert IF* to G*
      const newClassName = className.startsWith('IF') 
        ? 'G' + className.substring(2) 
        : className;
      
      patterns[newClassName] = {
        originalPath: relativePath,
        originalContent: content
      };
    }
  }
  
  return patterns;
}

async function getAllJsFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllJsFiles(fullPath));
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function extractClassFromBundle(code, className, position, nextPosition) {
  // We need to find the class definition and all its methods
  const searchStart = Math.max(0, position - 1000);
  const searchEnd = nextPosition ? Math.min(code.length, nextPosition) : Math.min(code.length, position + 50000);
  
  const segment = code.substring(searchStart, searchEnd);
  
  // Find the class in this segment
  const classResult = {
    constructor: null,
    inherit: null,
    prototype: [],
    statics: []
  };
  
  // Find constructor - search for function definitions around the position
  const funcPattern = new RegExp(`function\\s+${className}\\s*\\([^)]*\\)\\s*\\{`, 'g');
  let match = funcPattern.exec(segment);
  if (match) {
    // Extract full constructor body
    const startIdx = match.index;
    let braceCount = 1;
    let endIdx = startIdx + match[0].length;
    
    while (endIdx < segment.length && braceCount > 0) {
      if (segment[endIdx] === '{') braceCount++;
      else if (segment[endIdx] === '}') braceCount--;
      endIdx++;
    }
    
    classResult.constructor = segment.substring(startIdx, endIdx);
  }
  
  // Find inherit call
  const inheritPattern = new RegExp(`\\w+\\.inherit\\s*\\(\\s*${className}\\s*,\\s*(\\w+)\\s*\\)`, 'g');
  match = inheritPattern.exec(segment);
  if (match) {
    classResult.inherit = { parent: match[1], full: match[0] };
  }
  
  // Find inheritAndMix
  const mixPattern = new RegExp(`\\w+\\.inheritAndMix\\s*\\(\\s*${className}\\s*,\\s*(\\w+|null)\\s*,\\s*\\[([^\\]]+)\\]\\s*\\)`, 'g');
  match = mixPattern.exec(segment);
  if (match) {
    classResult.inherit = { 
      parent: match[1] !== 'null' ? match[1] : null, 
      mixins: match[2].split(',').map(m => m.trim()),
      full: match[0]
    };
  }
  
  // Find prototype methods
  const protoPattern = new RegExp(`${className}\\.prototype\\.(\\w+)\\s*=\\s*function\\s*\\([^)]*\\)\\s*\\{`, 'g');
  while ((match = protoPattern.exec(segment)) !== null) {
    const methodName = match[1];
    const startIdx = match.index;
    let braceCount = 1;
    let endIdx = startIdx + match[0].length;
    
    while (endIdx < segment.length && braceCount > 0) {
      if (segment[endIdx] === '{') braceCount++;
      else if (segment[endIdx] === '}') braceCount--;
      endIdx++;
    }
    
    classResult.prototype.push({
      name: methodName,
      code: segment.substring(startIdx, endIdx)
    });
  }
  
  // Find static methods
  const staticPattern = new RegExp(`${className}\\.(\\w+)\\s*=\\s*function\\s*\\([^)]*\\)\\s*\\{`, 'g');
  while ((match = staticPattern.exec(segment)) !== null) {
    if (match[1] === 'prototype') continue;
    
    const methodName = match[1];
    const startIdx = match.index;
    let braceCount = 1;
    let endIdx = startIdx + match[0].length;
    
    while (endIdx < segment.length && braceCount > 0) {
      if (segment[endIdx] === '{') braceCount++;
      else if (segment[endIdx] === '}') braceCount--;
      endIdx++;
    }
    
    classResult.statics.push({
      name: methodName,
      code: segment.substring(startIdx, endIdx)
    });
  }
  
  // Find static properties
  const propPattern = new RegExp(`${className}\\.(\\w+)\\s*=\\s*(?!function)([^;]+);`, 'g');
  while ((match = propPattern.exec(segment)) !== null) {
    if (match[1] === 'prototype') continue;
    
    classResult.statics.push({
      name: match[1],
      code: match[0],
      isProperty: true
    });
  }
  
  return classResult;
}

function generateReconstructedCode(className, classData, originalPattern) {
  let code = `/**
 * ${className}
 * 
 * Part of the Gravit Designer core engine
 * Reconstructed from minified source
 */

`;

  // Constructor
  if (classData.constructor) {
    code += classData.constructor + '\n\n';
  } else {
    code += `function ${className}() {\n  // Constructor\n}\n\n`;
  }
  
  // Inheritance
  if (classData.inherit) {
    if (classData.inherit.mixins) {
      code += `GObject.inheritAndMix(${className}, ${classData.inherit.parent || 'null'}, [${classData.inherit.mixins.join(', ')}]);\n\n`;
    } else {
      code += `GObject.inherit(${className}, ${classData.inherit.parent});\n\n`;
    }
  }
  
  // Prototype methods
  for (const method of classData.prototype) {
    code += method.code + '\n\n';
  }
  
  // Static methods and properties
  for (const stat of classData.statics) {
    code += stat.code + '\n\n';
  }
  
  // Module export
  code += `\nmodule.exports = ${className};\n`;
  
  return code;
}

async function main() {
  console.log('🔧 Gravit Designer Source Reconstructor (from class map)');
  console.log('=========================================================\n');
  
  // Read both bundles
  const vendorPath = path.join(PUBLIC_DIR, 'chunk.vendor.js');
  const designerPath = path.join(PUBLIC_DIR, 'designer.browser.js');
  
  const vendorCode = await fs.readFile(vendorPath, 'utf8');
  const designerCode = await fs.readFile(designerPath, 'utf8');
  
  console.log(`📄 Loaded vendor bundle (${(vendorCode.length / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`📄 Loaded designer bundle (${(designerCode.length / 1024 / 1024).toFixed(2)} MB)`);
  
  // Load original source patterns for reference
  const originalPatterns = await loadOriginalSourcePatterns();
  console.log(`📚 Loaded ${Object.keys(originalPatterns).length} original source patterns\n`);
  
  // Get classes sorted by position
  const classes = Object.entries(classMap.classes)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => a.position - b.position);
  
  console.log(`📊 Processing ${classes.length} classes...\n`);
  
  // Create output directories
  const dirs = [
    'infinity/core', 'infinity/scene', 'infinity/geometry', 'infinity/vertex',
    'infinity/paint', 'infinity/effects', 'infinity/event', 'infinity/other',
    'editor', 'application'
  ];
  
  for (const dir of dirs) {
    await fs.ensureDir(path.join(OUTPUT_DIR, dir));
  }
  
  let reconstructed = 0;
  let failed = 0;
  
  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    const nextCls = classes[i + 1];
    
    try {
      const code = cls.source === 'vendor' ? vendorCode : designerCode;
      const classData = await extractClassFromBundle(
        code,
        cls.name,
        cls.position,
        nextCls && nextCls.source === cls.source ? nextCls.position : null
      );
      
      // Only process if we found something meaningful
      if (classData.constructor || classData.prototype.length > 0) {
        const reconstructedCode = generateReconstructedCode(
          cls.name,
          classData,
          originalPatterns[cls.name]
        );
        
        const category = getCategory(cls.name);
        const outputPath = path.join(OUTPUT_DIR, category, `${cls.name}.js`);
        
        await fs.writeFile(outputPath, reconstructedCode);
        reconstructed++;
        
        if (reconstructed % 25 === 0) {
          console.log(`   Reconstructed ${reconstructed} classes...`);
        }
      }
    } catch (err) {
      failed++;
      // console.log(`   ⚠️ Failed to reconstruct ${cls.name}: ${err.message}`);
    }
  }
  
  console.log(`\n✅ Reconstructed ${reconstructed} classes`);
  if (failed > 0) {
    console.log(`⚠️ ${failed} classes could not be reconstructed`);
  }
  
  // Create main index.js
  await createIndex();
  
  console.log(`\n📁 Output: ${OUTPUT_DIR}/`);
}

async function createIndex() {
  // Gather all reconstructed files
  const files = [];
  
  async function scanDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await scanDir(fullPath);
      } else if (entry.name.endsWith('.js') && entry.name !== 'index.js') {
        files.push({
          name: entry.name.replace('.js', ''),
          path: path.relative(OUTPUT_DIR, fullPath).replace(/\\/g, '/')
        });
      }
    }
  }
  
  await scanDir(OUTPUT_DIR);
  
  let indexContent = `/**
 * Gravit Designer - Reconstructed Source Index
 * 
 * Auto-generated from class-map.json
 */

`;

  for (const file of files.sort((a, b) => a.name.localeCompare(b.name))) {
    indexContent += `exports.${file.name} = require('./${file.path}');\n`;
  }
  
  await fs.writeFile(path.join(OUTPUT_DIR, 'index.js'), indexContent);
  console.log('✅ Created index.js');
}

main().catch(console.error);
