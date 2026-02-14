/**
 * Gravit Designer Reverse Engineering - Variable Renamer
 * 
 * Uses AST analysis to intelligently rename minified variables
 * based on their usage patterns and context.
 * 
 * Usage: node rename-variables.js
 */

const fs = require('fs-extra');
const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');
const { generate } = require('astring');

const MODULE_DIR = path.join(__dirname, 'modules');
const OUTPUT_DIR = path.join(__dirname, 'renamed');

// Context-based renaming rules
const RENAME_RULES = {
  // Webpack module params (always in this order)
  moduleParams: ['module', 'exports', 'require'],
  
  // Common patterns
  patterns: {
    // Loop iterators
    loopPattern: {
      match: /for\s*\(\s*(?:var|let|const)\s+(\w)\s*=/,
      rename: { 'i': 'index', 'j': 'j', 'k': 'k', 'n': 'n', 'l': 'len' }
    },
    
    // Array methods
    arrayCallback: {
      params: ['element', 'index', 'array']
    },
    
    // Object iteration
    objectIteration: {
      params: ['key', 'value']
    },
    
    // Event handlers
    eventHandler: {
      match: /(?:addEventListener|on\w+)\s*\(\s*["'][^"']+["']\s*,\s*function\s*\((\w+)\)/,
      rename: { 0: 'event' }
    },
    
    // Constructor patterns
    constructor: {
      match: /function\s+G\w+\s*\(/,
      selfParam: 'self'
    }
  },
  
  // Variable usage context
  context: {
    // If used with .length, likely an array or string
    '.length': 'array',
    // If used with .prototype, it's a class
    '.prototype': 'Class',
    // If used with .call or .apply, it's a function
    '.call': 'func',
    '.apply': 'func',
    // If used with x, y properties, likely a point
    '.x': 'point',
    '.y': 'point',
    // If used with width, height, likely a rect or size
    '.width': 'rect',
    '.height': 'rect',
    // If used with getBBox, it's an element
    '.getBBox': 'element',
    // If used with transform, it's transformable
    '.transform': 'element',
    // If used with paint, it's paintable
    '.paint': 'paintable',
  }
};

// Inferred variable names based on operations
const TYPE_NAMES = {
  'array': ['arr', 'list', 'items', 'elements'],
  'point': ['point', 'pt', 'position', 'pos'],
  'rect': ['rect', 'bounds', 'bbox', 'box'],
  'element': ['element', 'elem', 'node', 'item'],
  'func': ['fn', 'callback', 'handler'],
  'Class': ['Class', 'Type', 'Constructor'],
  'paintable': ['shape', 'element', 'drawable'],
};

async function renameVariables() {
  console.log('🔤 Gravit Designer Variable Renamer');
  console.log('====================================\n');
  
  await fs.ensureDir(OUTPUT_DIR);
  
  // Get all extracted modules
  const categories = ['core', 'scene', 'geometry', 'effects', 'rendering', 'text', 'annotations', 'other'];
  
  for (const category of categories) {
    const categoryDir = path.join(MODULE_DIR, category);
    if (!(await fs.pathExists(categoryDir))) continue;
    
    await fs.ensureDir(path.join(OUTPUT_DIR, category));
    
    const files = await fs.readdir(categoryDir);
    
    for (const file of files) {
      if (!file.endsWith('.js')) continue;
      
      const inputPath = path.join(categoryDir, file);
      const outputPath = path.join(OUTPUT_DIR, category, file);
      
      try {
        const code = await fs.readFile(inputPath, 'utf8');
        const renamed = await renameInFile(code, file);
        await fs.writeFile(outputPath, renamed);
      } catch (err) {
        // Copy original if renaming fails
        await fs.copy(inputPath, outputPath);
      }
    }
    
    console.log(`✅ Processed ${category}/`);
  }
  
  console.log('\n✨ Variable renaming complete!');
  console.log(`📁 Output: ${OUTPUT_DIR}/`);
}

async function renameInFile(code, filename) {
  // Extract class name from filename
  const classMatch = filename.match(/\d+-(\w+)\.js/);
  const className = classMatch ? classMatch[1] : null;
  
  // Try to parse the code
  let ast;
  try {
    // Remove header comment for parsing
    const codeBody = code.replace(/^\/\*\*[\s\S]*?\*\/\s*/, '');
    ast = acorn.parse(`(${codeBody})`, { ecmaVersion: 2020 });
  } catch (e) {
    // Return original if can't parse
    return code;
  }
  
  // Build variable usage map
  const varUsage = {};
  const varTypes = {};
  
  // First pass: collect variable usage patterns
  walk.simple(ast, {
    Identifier(node) {
      // Skip property names
      if (node.name.length === 1) {
        if (!varUsage[node.name]) varUsage[node.name] = [];
      }
    },
    
    MemberExpression(node) {
      if (node.object.type === 'Identifier' && node.object.name.length === 1) {
        const varName = node.object.name;
        const propName = node.property.type === 'Identifier' ? '.' + node.property.name : '';
        
        if (!varUsage[varName]) varUsage[varName] = [];
        varUsage[varName].push(propName);
        
        // Infer type from property access
        if (RENAME_RULES.context[propName]) {
          varTypes[varName] = RENAME_RULES.context[propName];
        }
      }
    },
    
    FunctionExpression(node) {
      // Rename function parameters based on position
      if (node.params.length >= 3) {
        // Likely a webpack module function
        node.params.forEach((param, i) => {
          if (param.type === 'Identifier' && param.name.length === 1) {
            if (i < RENAME_RULES.moduleParams.length) {
              varTypes[param.name] = RENAME_RULES.moduleParams[i];
            }
          }
        });
      }
    },
    
    CallExpression(node) {
      // Detect array methods
      if (node.callee.type === 'MemberExpression' && 
          node.callee.property.type === 'Identifier') {
        const methodName = node.callee.property.name;
        
        if (['forEach', 'map', 'filter', 'find', 'some', 'every', 'reduce'].includes(methodName)) {
          // The callback's first param is an element
          if (node.arguments[0] && node.arguments[0].type === 'FunctionExpression') {
            const callback = node.arguments[0];
            if (callback.params[0] && callback.params[0].name.length === 1) {
              varTypes[callback.params[0].name] = 'element';
            }
          }
        }
      }
    }
  });
  
  // Build rename map
  const renameMap = {};
  let counter = {};
  
  for (const [varName, inferredType] of Object.entries(varTypes)) {
    if (inferredType && TYPE_NAMES[inferredType]) {
      const candidateNames = TYPE_NAMES[inferredType];
      const baseName = candidateNames[0];
      
      if (!counter[baseName]) counter[baseName] = 0;
      const suffix = counter[baseName] > 0 ? counter[baseName] : '';
      
      renameMap[varName] = baseName + suffix;
      counter[baseName]++;
    }
  }
  
  // Special handling for common patterns
  if (renameMap['e']) renameMap['e'] = 'module';
  if (renameMap['t']) renameMap['t'] = 'exports';
  if (renameMap['n'] && !renameMap['require']) renameMap['n'] = 'require';
  
  // If we have meaningful renames, apply them
  if (Object.keys(renameMap).length === 0) {
    return code;
  }
  
  // Apply renames using string replacement (simpler than AST transform)
  let result = code;
  
  for (const [oldName, newName] of Object.entries(renameMap)) {
    // Only rename single-letter variables followed by non-word characters
    const pattern = new RegExp(`\\b${oldName}\\b(?=[^\\w])`, 'g');
    result = result.replace(pattern, newName);
  }
  
  // Add rename documentation header
  const renameDoc = `/**
 * Variable Renames Applied:
 * ${Object.entries(renameMap).map(([o, n]) => `${o} -> ${n}`).join(', ')}
 */

`;
  
  return renameDoc + result;
}

renameVariables().catch(console.error);
