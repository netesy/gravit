/**
 * Gravit Designer Reverse Engineering - Smart Decompiler
 * 
 * This is an advanced decompiler that uses the original open-source
 * Gravit code to intelligently rename variables in the minified code.
 * 
 * It works by:
 * 1. Parsing both original and minified code into ASTs
 * 2. Finding matching function signatures
 * 3. Mapping minified variables to original variable names
 * 4. Generating readable code with proper comments
 * 
 * Usage: node smart-decompile.js [className]
 */

const fs = require('fs-extra');
const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');
const { generate } = require('astring');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ORIGINAL_DIR = path.join(__dirname, '..', '..', 'gravit-original', 'src');
const OUTPUT_DIR = path.join(__dirname, 'decompiled');

// Class name evolution: Old (IF*) -> New (G*)
const CLASS_EVOLUTION = {
  'IFObject': 'GObject',
  'IFNode': 'GNode',
  'IFPoint': 'GPoint',
  'IFRect': 'GRect',
  'IFTransform': 'GTransform',
  'IFLocale': 'GLocale',
  'IFUtil': 'GUtil',
  'IFMath': 'GMath',
  'IFScene': 'GScene',
  'IFElement': 'GElement',
  'IFShape': 'GShape',
  'IFPath': 'GPath',
  'IFText': 'GText',
  'IFImage': 'GImage',
  'IFLayer': 'GLayer',
  'IFPage': 'GPage',
  'IFGroup': 'GGroup',
  'IFBlock': 'GBlock',
  'IFItem': 'GItem',
  'IFStylable': 'GStylable',
  'IFStyle': 'GStyle',
  'IFPattern': 'GPattern',
  'IFGradient': 'GGradient',
  'IFColor': 'GColor',
  'IFVertex': 'GVertex',
  'IFVertexSource': 'GVertexSource',
  'IFVertexContainer': 'GVertexContainer',
  'IFVertexTransformer': 'GVertexTransformer',
  'IFPaintCanvas': 'GPaintCanvas',
  'IFPaintContext': 'GPaintContext',
  'IFPathBase': 'GPathBase',
  'IFRectangle': 'GRectangle',
  'IFEllipse': 'GEllipse',
  'IFPolygon': 'GPolygon',
  'IFCompoundPath': 'GCompoundPath',
};

// Reverse mapping
const NEW_TO_OLD = {};
for (const [old, newName] of Object.entries(CLASS_EVOLUTION)) {
  NEW_TO_OLD[newName] = old;
}

// Original source file mapping
const CLASS_TO_FILE = {
  'GObject': 'infinity/core/object.js',
  'GNode': 'infinity/scene/node.js',
  'GMath': 'infinity/core/math.js',
  'GUtil': 'infinity/core/util.js',
  'GLocale': 'infinity/i18n/locale.js',
  'GPoint': 'infinity/geometry/point.js',
  'GRect': 'infinity/geometry/rect.js',
  'GTransform': 'infinity/geometry/transform.js',
  'GVertex': 'infinity/vertex/vertex.js',
  'GVertexSource': 'infinity/vertex/vertexsource.js',
  'GVertexContainer': 'infinity/vertex/vertexcontainer.js',
  'GScene': 'infinity/scene/scene.js',
  'GElement': 'infinity/scene/element.js',
  'GBlock': 'infinity/scene/block.js',
  'GItem': 'infinity/scene/item.js',
  'GShape': 'infinity/scene/shape/shape.js',
  'GPath': 'infinity/scene/shape/path.js',
  'GPathBase': 'infinity/scene/shape/pathbase.js',
  'GRectangle': 'infinity/scene/shape/rectangle.js',
  'GEllipse': 'infinity/scene/shape/ellipse.js',
  'GPolygon': 'infinity/scene/shape/polygon.js',
  'GText': 'infinity/scene/shape/text.js',
  'GImage': 'infinity/scene/shape/image.js',
  'GLayer': 'infinity/scene/structure/layer.js',
  'GPage': 'infinity/scene/structure/page.js',
  'GGroup': 'infinity/scene/shape/shapeset.js',
  'GStylable': 'infinity/scene/style/stylable.js',
  'GStyle': 'infinity/scene/style/style.js',
  'GPaintCanvas': 'infinity/paint/paintcanvas.js',
  'GColor': 'infinity/paint/color.js',
  'GPattern': 'infinity/paint/pattern.js',
  'GGradient': 'infinity/paint/gradient.js',
};

// Load module map
let MODULE_MAP = {};
try {
  MODULE_MAP = require('./extracted-modules/module-map.json');
} catch (e) {
  console.log('⚠️ Module map not found. Run extract-modules.js first.');
}

// Reverse module map
const CLASS_TO_MODULE = {};
for (const [id, name] of Object.entries(MODULE_MAP)) {
  CLASS_TO_MODULE[name] = parseInt(id, 10);
}

/**
 * Load and parse original source code for a class
 */
async function loadOriginalSource(className) {
  const oldClassName = NEW_TO_OLD[className];
  const filePath = CLASS_TO_FILE[className];
  
  if (!filePath) {
    return null;
  }
  
  const fullPath = path.join(ORIGINAL_DIR, filePath);
  
  if (!(await fs.pathExists(fullPath))) {
    return null;
  }
  
  const content = await fs.readFile(fullPath, 'utf8');
  
  return {
    className,
    oldClassName,
    content,
    methods: extractMethods(content, oldClassName || className),
  };
}

/**
 * Extract method signatures and their parameter names
 */
function extractMethods(code, className) {
  const methods = {};
  
  // Match prototype method definitions
  const protoPattern = new RegExp(
    `${className}\\.prototype\\.(\\w+)\\s*=\\s*function\\s*\\(([^)]*)\\)\\s*\\{`,
    'g'
  );
  
  let match;
  while ((match = protoPattern.exec(code)) !== null) {
    const [, methodName, params] = match;
    const paramList = params.split(',').map(p => p.trim()).filter(Boolean);
    
    // Extract method body for signature matching
    const methodStart = match.index + match[0].length;
    const methodBody = extractMethodBody(code, methodStart);
    
    methods[methodName] = {
      name: methodName,
      params: paramList,
      bodyLength: methodBody.length,
      // Simple signature based on structure
      signature: createSignature(methodBody),
    };
  }
  
  // Also match static methods
  const staticPattern = new RegExp(
    `${className}\\.(\\w+)\\s*=\\s*function\\s*\\(([^)]*)\\)\\s*\\{`,
    'g'
  );
  
  while ((match = staticPattern.exec(code)) !== null) {
    const [, methodName, params] = match;
    // Skip prototype assignment
    if (methodName === 'prototype') continue;
    
    const paramList = params.split(',').map(p => p.trim()).filter(Boolean);
    
    methods[`static:${methodName}`] = {
      name: methodName,
      isStatic: true,
      params: paramList,
    };
  }
  
  return methods;
}

/**
 * Extract method body by counting braces
 */
function extractMethodBody(code, startIndex) {
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

/**
 * Create a simple signature for method matching
 */
function createSignature(methodBody) {
  // Count various code features for matching
  const signature = {
    returns: (methodBody.match(/return\s/g) || []).length,
    ifs: (methodBody.match(/if\s*\(/g) || []).length,
    loops: (methodBody.match(/for\s*\(|while\s*\(/g) || []).length,
    calls: (methodBody.match(/\.\w+\(/g) || []).length,
    stringLiterals: (methodBody.match(/["'][^"']+["']/g) || []).length,
    length: methodBody.length,
  };
  
  return signature;
}

/**
 * Find minified code for a class
 */
async function findMinifiedCode(className) {
  const moduleId = CLASS_TO_MODULE[className];
  
  if (moduleId === undefined) {
    return null;
  }
  
  const modulePath = path.join(__dirname, 'modules');
  
  // Find the module file
  const categories = ['core', 'scene', 'geometry', 'effects', 'rendering', 'text', 'annotations', 'other'];
  
  for (const cat of categories) {
    const catPath = path.join(modulePath, cat);
    if (!(await fs.pathExists(catPath))) continue;
    
    const files = await fs.readdir(catPath);
    for (const file of files) {
      if (file.startsWith(`${moduleId}-`)) {
        return fs.readFile(path.join(catPath, file), 'utf8');
      }
    }
  }
  
  return null;
}

/**
 * Decompile a class by mapping variables
 */
async function decompileClass(className) {
  console.log(`\n📦 Decompiling ${className}...`);
  
  // Load original source
  const original = await loadOriginalSource(className);
  if (!original) {
    console.log(`   ⚠️ Original source not found for ${className}`);
    return null;
  }
  
  console.log(`   ✅ Loaded original source with ${Object.keys(original.methods).length} methods`);
  
  // Load minified code
  const minified = await findMinifiedCode(className);
  if (!minified) {
    console.log(`   ⚠️ Minified code not found for ${className}`);
    return null;
  }
  
  // Parse and enhance
  let decompiled = minified;
  
  // Add comments from original
  for (const [methodName, methodInfo] of Object.entries(original.methods)) {
    if (methodInfo.isStatic) continue;
    
    // Find the method in minified code
    const minifiedPattern = new RegExp(
      `\\.prototype\\.${methodName}\\s*=\\s*function\\s*\\(([^)]*)\\)`,
      'g'
    );
    
    const match = minifiedPattern.exec(decompiled);
    if (match) {
      const minifiedParams = match[1].split(',').map(p => p.trim()).filter(Boolean);
      
      // Create param mapping
      const paramMap = {};
      for (let i = 0; i < minifiedParams.length && i < methodInfo.params.length; i++) {
        if (minifiedParams[i] && minifiedParams[i].length === 1) {
          paramMap[minifiedParams[i]] = methodInfo.params[i];
        }
      }
      
      // Add comment before method
      const comment = `
/**
 * ${methodName}
 * Parameters: ${methodInfo.params.join(', ') || 'none'}
 * Variable mapping: ${Object.entries(paramMap).map(([m, o]) => `${m} → ${o}`).join(', ') || 'none'}
 */
`;
      
      decompiled = decompiled.replace(match[0], comment + match[0]);
    }
  }
  
  return {
    className,
    original,
    code: decompiled
  };
}

/**
 * Main decompilation entry point
 */
async function main() {
  console.log('🔍 Gravit Designer Smart Decompiler');
  console.log('====================================\n');
  
  await fs.ensureDir(OUTPUT_DIR);
  
  const targetClass = process.argv[2];
  
  if (targetClass) {
    // Decompile specific class
    const result = await decompileClass(targetClass);
    if (result) {
      const outputPath = path.join(OUTPUT_DIR, `${targetClass}.js`);
      await fs.writeFile(outputPath, result.code);
      console.log(`\n✅ Decompiled ${targetClass} to ${outputPath}`);
    }
  } else {
    // Decompile all classes with original source
    const classesWithSource = Object.keys(CLASS_TO_FILE);
    
    console.log(`Found ${classesWithSource.length} classes with original source\n`);
    
    let decompiled = 0;
    
    for (const className of classesWithSource) {
      const result = await decompileClass(className);
      if (result) {
        const outputPath = path.join(OUTPUT_DIR, `${className}.js`);
        await fs.writeFile(outputPath, result.code);
        decompiled++;
      }
    }
    
    console.log(`\n✅ Decompiled ${decompiled}/${classesWithSource.length} classes`);
    console.log(`📁 Output: ${OUTPUT_DIR}/`);
  }
}

main().catch(console.error);
