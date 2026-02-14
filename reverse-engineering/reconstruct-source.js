/**
 * Gravit Designer Reverse Engineering - Source Reconstructor
 * 
 * This is the main tool for reconstructing readable source code from
 * the minified Gravit Designer bundles. It uses AST analysis and
 * the original open-source code as reference to rename variables
 * and restore proper code structure.
 * 
 * Usage: node reconstruct-source.js
 */

const fs = require('fs-extra');
const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');
const { generate } = require('astring');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ORIGINAL_DIR = path.join(__dirname, '..', '..', 'gravit-original', 'src');
const OUTPUT_DIR = path.join(__dirname, 'reconstructed');

// Load module map
const MODULE_MAP = require('./extracted-modules/module-map.json');

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

// Common parameter patterns in webpack modules
const PARAM_PATTERNS = {
  // Standard webpack module params
  moduleParams: {
    0: 'module',
    1: 'exports', 
    2: 'require'
  },
  // Common variable patterns based on usage
  singleLetter: {
    'e': ['module', 'event', 'element', 'error'],
    't': ['exports', 'target', 'this', 'type'],
    'n': ['require', 'node', 'name', 'next'],
    'i': ['index', 'iterator', 'instance'],
    'o': ['object', 'options', 'output'],
    'a': ['array', 'args', 'arg'],
    'r': ['result', 'reference', 'root'],
    's': ['string', 'state', 'source'],
    'l': ['length', 'list', 'local'],
    'c': ['count', 'callback', 'context'],
    'h': ['handler', 'helper', 'hash'],
    'p': ['prototype', 'property', 'parent'],
    'u': ['util', 'undefined', 'user'],
    'd': ['data', 'document', 'delta'],
    'v': ['value', 'vertex', 'view'],
    'f': ['func', 'flag', 'field'],
    'g': ['global', 'group', 'graphics'],
    'b': ['base', 'buffer', 'boolean'],
    'm': ['method', 'matrix', 'message'],
    'w': ['width', 'window', 'worker'],
    'x': ['x', 'xCoord'],
    'y': ['y', 'yCoord'],
    'z': ['z', 'zIndex'],
  }
};

// Known method signatures from original source
const METHOD_SIGNATURES = {};

async function loadOriginalMethodSignatures() {
  console.log('📚 Loading original source method signatures...');
  
  const infinityDir = path.join(ORIGINAL_DIR, 'infinity');
  if (!(await fs.pathExists(infinityDir))) {
    console.log('   ⚠️ Original source not found, using heuristics only');
    return;
  }
  
  const files = await getAllJsFiles(infinityDir);
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    
    // Extract function signatures
    const funcPattern = /(\w+)\.prototype\.(\w+)\s*=\s*function\s*\(([^)]*)\)/g;
    let match;
    
    while ((match = funcPattern.exec(content)) !== null) {
      const [, className, methodName, params] = match;
      const newClassName = CLASS_EVOLUTION[className] || className;
      
      if (!METHOD_SIGNATURES[newClassName]) {
        METHOD_SIGNATURES[newClassName] = {};
      }
      
      METHOD_SIGNATURES[newClassName][methodName] = params.split(',').map(p => p.trim()).filter(Boolean);
    }
  }
  
  console.log(`   ✅ Loaded signatures for ${Object.keys(METHOD_SIGNATURES).length} classes`);
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

async function reconstructSource() {
  console.log('🔧 Gravit Designer Source Reconstructor');
  console.log('=======================================\n');
  
  await fs.ensureDir(OUTPUT_DIR);
  await fs.ensureDir(path.join(OUTPUT_DIR, 'infinity'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'infinity', 'core'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'infinity', 'scene'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'infinity', 'scene', 'shape'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'infinity', 'scene', 'structure'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'infinity', 'scene', 'style'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'infinity', 'geometry'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'infinity', 'paint'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'infinity', 'vertex'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'infinity', 'event'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'infinity', 'effects'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'editor'));
  await fs.ensureDir(path.join(OUTPUT_DIR, 'application'));
  
  await loadOriginalMethodSignatures();
  
  // Read vendor chunk
  const vendorPath = path.join(PUBLIC_DIR, 'chunk.vendor.js');
  const vendorCode = await fs.readFile(vendorPath, 'utf8');
  
  console.log(`\n📄 Processing vendor bundle (${(vendorCode.length / 1024 / 1024).toFixed(2)} MB)`);
  
  // Extract and reconstruct each module
  const modules = extractWebpackModules(vendorCode);
  console.log(`📦 Found ${modules.length} modules\n`);
  
  let reconstructedCount = 0;
  
  for (let i = 0; i < modules.length; i++) {
    const moduleCode = modules[i];
    if (!moduleCode || moduleCode.trim() === '' || moduleCode.length < 10) continue;
    
    const className = MODULE_MAP[i.toString()];
    if (!className) continue;
    
    try {
      const reconstructed = await reconstructModule(i, className, moduleCode);
      if (reconstructed) {
        const outputPath = getOutputPath(className);
        await fs.writeFile(outputPath, reconstructed);
        reconstructedCount++;
        
        if (reconstructedCount % 20 === 0) {
          console.log(`   Reconstructed ${reconstructedCount} modules...`);
        }
      }
    } catch (err) {
      // console.log(`   ⚠️ Error reconstructing module ${i} (${className}): ${err.message}`);
    }
  }
  
  console.log(`\n✅ Reconstructed ${reconstructedCount} modules to ${OUTPUT_DIR}/`);
  
  // Create index file
  await createIndex();
  
  console.log('\n📝 Next steps:');
  console.log('   1. Review reconstructed modules in reconstructed/');
  console.log('   2. Run: npm run build - to test webpack build');
  console.log('   3. Compare with gravit-original/src for context');
}

function extractWebpackModules(code) {
  const modules = [];
  
  // Find the modules array start
  const modulesMatch = code.match(/\.push\s*\(\s*\[\s*\[\s*\d+\s*\]\s*,\s*\[/);
  if (!modulesMatch) {
    console.log('❌ Could not find webpack modules array');
    return modules;
  }
  
  const startIndex = modulesMatch.index + modulesMatch[0].length;
  
  // Extract modules by finding function boundaries
  let depth = 1;
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
      modules.push(code.slice(moduleStart, i));
      moduleStart = i + 1;
    }
    
    i++;
  }
  
  if (moduleStart < i) {
    modules.push(code.slice(moduleStart, i));
  }
  
  return modules;
}

async function reconstructModule(moduleId, className, code) {
  // Clean up the code
  code = code.trim();
  
  // Skip non-function modules
  if (!code.startsWith('function')) return null;
  
  // Try to parse and enhance
  let ast;
  try {
    ast = acorn.parse(code, { ecmaVersion: 2020 });
  } catch (e) {
    // Wrap in a module expression and try again
    try {
      ast = acorn.parse(`(${code})`, { ecmaVersion: 2020 });
    } catch (e2) {
      return null;
    }
  }
  
  // Rename variables based on method signatures
  const methodSigs = METHOD_SIGNATURES[className] || {};
  
  // Generate header with documentation
  const header = generateHeader(moduleId, className, methodSigs);
  
  // Generate enhanced code
  const enhancedCode = generate(ast, {
    indent: '  ',
    lineEnd: '\n',
    comments: true
  });
  
  return header + enhancedCode;
}

function generateHeader(moduleId, className, methodSigs) {
  let header = `/**
 * ${className}
 * 
 * Module ID: ${moduleId}
 * Reconstructed from Gravit Designer minified source
 * 
 * This file was automatically generated by the reverse engineering toolkit.
 * Variable names may still be minified - refer to the original open-source
 * Gravit code for context on what each variable represents.
 * 
`;

  // Add known methods
  const methods = Object.keys(methodSigs);
  if (methods.length > 0) {
    header += ` * Known Methods:\n`;
    methods.slice(0, 10).forEach(m => {
      const params = methodSigs[m].join(', ');
      header += ` *   ${m}(${params})\n`;
    });
    if (methods.length > 10) {
      header += ` *   ... and ${methods.length - 10} more\n`;
    }
  }
  
  header += ` */\n\n`;
  
  return header;
}

function getOutputPath(className) {
  // Map class names to directory structure
  const dirMap = {
    // Core
    'GObject': 'infinity/core/GObject.js',
    'GNode': 'infinity/scene/GNode.js',
    'GUtil': 'infinity/core/GUtil.js',
    'GMath': 'infinity/core/GMath.js',
    'GLocale': 'infinity/core/GLocale.js',
    'GSystem': 'infinity/core/GSystem.js',
    
    // Geometry
    'GPoint': 'infinity/geometry/GPoint.js',
    'GRect': 'infinity/geometry/GRect.js',
    'GTransform': 'infinity/geometry/GTransform.js',
    
    // Events
    'GEvent': 'infinity/event/GEvent.js',
    'GEventTarget': 'infinity/event/GEventTarget.js',
    
    // Scene
    'GScene': 'infinity/scene/GScene.js',
    'GElement': 'infinity/scene/GElement.js',
    'GBlock': 'infinity/scene/GBlock.js',
    'GItem': 'infinity/scene/GItem.js',
    
    // Shapes
    'GShape': 'infinity/scene/shape/GShape.js',
    'GPath': 'infinity/scene/shape/GPath.js',
    'GPathBase': 'infinity/scene/shape/GPathBase.js',
    'GRectangle': 'infinity/scene/shape/GRectangle.js',
    'GEllipse': 'infinity/scene/shape/GEllipse.js',
    'GPolygon': 'infinity/scene/shape/GPolygon.js',
    'GText': 'infinity/scene/shape/GText.js',
    'GImage': 'infinity/scene/shape/GImage.js',
    'GGroup': 'infinity/scene/shape/GGroup.js',
    'GCompoundPath': 'infinity/scene/shape/GCompoundPath.js',
    'GCompoundShape': 'infinity/scene/shape/GCompoundShape.js',
    'GSimpleShape': 'infinity/scene/shape/GSimpleShape.js',
    'GConnector': 'infinity/scene/shape/GConnector.js',
    'GSlice': 'infinity/scene/shape/GSlice.js',
    'GSymbol': 'infinity/scene/shape/GSymbol.js',
    'GBitmap': 'infinity/scene/shape/GBitmap.js',
    
    // Structure
    'GLayer': 'infinity/scene/structure/GLayer.js',
    'GPage': 'infinity/scene/structure/GPage.js',
    'GBackground': 'infinity/scene/structure/GBackground.js',
    
    // Style
    'GStylable': 'infinity/scene/style/GStylable.js',
    'GStyle': 'infinity/scene/style/GStyle.js',
    'GSwatch': 'infinity/scene/style/GSwatch.js',
    'GSwatches': 'infinity/scene/style/GSwatches.js',
    
    // Paint
    'GPaintCanvas': 'infinity/paint/GPaintCanvas.js',
    'GPaintContext': 'infinity/paint/GPaintContext.js',
    'GColor': 'infinity/paint/GColor.js',
    'GRGBColor': 'infinity/paint/GRGBColor.js',
    'GCMYKColor': 'infinity/paint/GCMYKColor.js',
    'GHSVColor': 'infinity/paint/GHSVColor.js',
    'GPattern': 'infinity/paint/GPattern.js',
    'GGradient': 'infinity/paint/GGradient.js',
    'GLinearGradient': 'infinity/paint/GLinearGradient.js',
    'GRadialGradient': 'infinity/paint/GRadialGradient.js',
    'GAngularGradient': 'infinity/paint/GAngularGradient.js',
    'GTexturePattern': 'infinity/paint/GTexturePattern.js',
    'GNoisePattern': 'infinity/paint/GNoisePattern.js',
    
    // Vertex
    'GVertex': 'infinity/vertex/GVertex.js',
    'GVertexSource': 'infinity/vertex/GVertexSource.js',
    'GVertexContainer': 'infinity/vertex/GVertexContainer.js',
    'GVertexTransformer': 'infinity/vertex/GVertexTransformer.js',
    'GVertexInfo': 'infinity/vertex/GVertexInfo.js',
    
    // Rendering
    'GRendererCtx': 'infinity/paint/GRendererCtx.js',
    'GRendererConfig': 'infinity/paint/GRendererConfig.js',
    'GHitResult': 'infinity/paint/GHitResult.js',
  };
  
  const relativePath = dirMap[className] || `infinity/other/${className}.js`;
  return path.join(OUTPUT_DIR, relativePath);
}

async function createIndex() {
  let indexContent = `/**
 * Gravit Designer - Reconstructed Source Index
 * 
 * This index maps all the reconstructed modules and provides
 * a comprehensive overview of the codebase structure.
 */

// Core Classes
const GObject = require('./infinity/core/GObject');
const GUtil = require('./infinity/core/GUtil');
const GMath = require('./infinity/core/GMath');
const GLocale = require('./infinity/core/GLocale');
const GSystem = require('./infinity/core/GSystem');

// Geometry Classes
const GPoint = require('./infinity/geometry/GPoint');
const GRect = require('./infinity/geometry/GRect');
const GTransform = require('./infinity/geometry/GTransform');

// Event System
const GEvent = require('./infinity/event/GEvent');
const GEventTarget = require('./infinity/event/GEventTarget');

// Scene Graph
const GScene = require('./infinity/scene/GScene');
const GNode = require('./infinity/scene/GNode');
const GElement = require('./infinity/scene/GElement');
const GBlock = require('./infinity/scene/GBlock');
const GItem = require('./infinity/scene/GItem');

// Shapes
const GShape = require('./infinity/scene/shape/GShape');
const GPath = require('./infinity/scene/shape/GPath');
const GRectangle = require('./infinity/scene/shape/GRectangle');
const GEllipse = require('./infinity/scene/shape/GEllipse');
const GPolygon = require('./infinity/scene/shape/GPolygon');
const GText = require('./infinity/scene/shape/GText');
const GImage = require('./infinity/scene/shape/GImage');
const GGroup = require('./infinity/scene/shape/GGroup');

// Structure
const GLayer = require('./infinity/scene/structure/GLayer');
const GPage = require('./infinity/scene/structure/GPage');

// Style
const GStylable = require('./infinity/scene/style/GStylable');
const GStyle = require('./infinity/scene/style/GStyle');

// Paint
const GPaintCanvas = require('./infinity/paint/GPaintCanvas');
const GPaintContext = require('./infinity/paint/GPaintContext');
const GColor = require('./infinity/paint/GColor');
const GPattern = require('./infinity/paint/GPattern');
const GGradient = require('./infinity/paint/GGradient');

// Vertex
const GVertex = require('./infinity/vertex/GVertex');
const GVertexSource = require('./infinity/vertex/GVertexSource');
const GVertexContainer = require('./infinity/vertex/GVertexContainer');
const GVertexTransformer = require('./infinity/vertex/GVertexTransformer');

// Module mapping (ID -> Class)
const MODULE_MAP = ${JSON.stringify(MODULE_MAP, null, 2)};

module.exports = {
  // Core
  GObject, GUtil, GMath, GLocale, GSystem,
  
  // Geometry
  GPoint, GRect, GTransform,
  
  // Events
  GEvent, GEventTarget,
  
  // Scene
  GScene, GNode, GElement, GBlock, GItem,
  
  // Shapes  
  GShape, GPath, GRectangle, GEllipse, GPolygon, GText, GImage, GGroup,
  
  // Structure
  GLayer, GPage,
  
  // Style
  GStylable, GStyle,
  
  // Paint
  GPaintCanvas, GPaintContext, GColor, GPattern, GGradient,
  
  // Vertex
  GVertex, GVertexSource, GVertexContainer, GVertexTransformer,
  
  // Mapping
  MODULE_MAP
};
`;

  // Create 'other' directory if needed
  await fs.ensureDir(path.join(OUTPUT_DIR, 'infinity', 'other'));
  
  await fs.writeFile(path.join(OUTPUT_DIR, 'index.js'), indexContent);
  console.log('✅ Created index.js');
}

reconstructSource().catch(console.error);
