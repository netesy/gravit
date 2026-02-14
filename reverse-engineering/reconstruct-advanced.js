/**
 * Gravit Designer - Advanced Module Reconstructor
 * 
 * Extracts webpack modules and reconstructs readable source code
 * by using the module map to identify class names and rename
 * minified variables.
 * 
 * Usage: node reconstruct-advanced.js
 */

const fs = require('fs-extra');
const path = require('path');
const acorn = require('acorn');
const { generate } = require('astring');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_DIR = path.join(__dirname, 'reconstructed');

// Load module map
const MODULE_MAP = require('./extracted-modules/module-map.json');

// Category mapping
function getCategory(className) {
  if (!className) return 'infinity/other';
  
  // Core
  if (['GObject', 'GNode', 'GEvent', 'GEventTarget', 'GLocale', 'GUtil', 'GMath', 'GSystem', 'GLocaleKey', 'GLocaleLanguage', 'GActionable', 'GTransactionRecorder', 'GDictionary', 'GDate', 'GLength'].includes(className)) {
    return 'infinity/core';
  }
  
  // Scene
  if (className.match(/Scene|Element|Layer|Page|Group|Block|Item|Symbol|Stylable|Style|Swatch|Background|Workspace|Annotable/)) {
    return 'infinity/scene';
  }
  
  // Vertex/Geometry
  if (className.match(/Vertex|Path/)) {
    return 'infinity/vertex';
  }
  
  // Shapes
  if (className.match(/Shape|Polygon|Ellipse|Rectangle|Compound|Connector|Slice|SimpleShape/)) {
    return 'infinity/scene';
  }
  
  // Points and transforms
  if (className.match(/Point|Rect|Transform|HitResult/)) {
    return 'infinity/geometry';
  }
  
  // Effects
  if (className.match(/Effect|Shadow|Blur|Glow|Mirror|Multi/)) {
    return 'infinity/effects';
  }
  
  // Paint/Rendering
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

/**
 * Parse webpack bundle and extract module functions
 */
function extractModuleFunctions(code) {
  const modules = {};
  
  // Find modules array pattern: .push([[0], [function(e,t){...}, ...]])
  const startMatch = code.match(/\.push\s*\(\s*\[\s*\[\s*\d+\s*\]\s*,\s*\[/);
  if (!startMatch) {
    console.log('Could not find modules array');
    return modules;
  }
  
  let pos = startMatch.index + startMatch[0].length;
  let moduleIndex = 0;
  
  while (pos < code.length) {
    // Skip whitespace and commas
    while (pos < code.length && /[\s,]/.test(code[pos])) pos++;
    
    if (code[pos] === ']') break; // End of modules array
    
    if (code.substring(pos, pos + 8) === 'function') {
      // Found a module function
      const funcStart = pos;
      
      // Find opening brace
      while (pos < code.length && code[pos] !== '{') pos++;
      
      // Find matching closing brace
      let braceCount = 1;
      pos++; // Move past opening brace
      
      while (pos < code.length && braceCount > 0) {
        const char = code[pos];
        
        // Handle strings
        if (char === '"' || char === "'" || char === '`') {
          const quote = char;
          pos++;
          while (pos < code.length) {
            if (code[pos] === '\\') {
              pos += 2;
              continue;
            }
            if (code[pos] === quote) {
              pos++;
              break;
            }
            pos++;
          }
          continue;
        }
        
        // Handle regex
        if (char === '/' && code[pos - 1] !== '\\') {
          const prevChar = code[pos - 1];
          if (prevChar === '=' || prevChar === '(' || prevChar === ',' || prevChar === ':' || prevChar === '[') {
            pos++;
            while (pos < code.length) {
              if (code[pos] === '\\') {
                pos += 2;
                continue;
              }
              if (code[pos] === '/') {
                pos++;
                // Skip flags
                while (pos < code.length && /[gimsuy]/.test(code[pos])) pos++;
                break;
              }
              pos++;
            }
            continue;
          }
        }
        
        if (char === '{') braceCount++;
        else if (char === '}') braceCount--;
        
        pos++;
      }
      
      const moduleCode = code.substring(funcStart, pos);
      
      // Store module
      const className = MODULE_MAP[moduleIndex];
      if (className) {
        modules[moduleIndex] = {
          className,
          code: moduleCode,
          startPos: funcStart
        };
      }
      
      moduleIndex++;
    } else {
      // Empty module slot (just a comma)
      moduleIndex++;
      pos++;
    }
  }
  
  return modules;
}

/**
 * Find the main exported variable in a module
 */
function findExportedVariable(code) {
  // Pattern: e.exports = varName
  const match = code.match(/e\.exports\s*=\s*([a-z_$][a-z0-9_$]*)\s*[;}]/i);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Reconstruct a module with proper class name
 */
function reconstructModule(className, moduleCode, moduleId) {
  // Find the exported variable name
  const exportedVar = findExportedVariable(moduleCode);
  
  if (!exportedVar) {
    return null;
  }
  
  // Create a readable version
  let code = moduleCode;
  
  // Remove the wrapper function
  code = code.replace(/^function\s*\([^)]*\)\s*\{/, '');
  code = code.replace(/\}\s*$/, '');
  
  // Replace the minified variable with the class name in key patterns
  const patterns = [
    // Constructor function
    new RegExp(`function\\s+${exportedVar}\\s*\\(`, 'g'),
    // Prototype methods
    new RegExp(`${exportedVar}\\.prototype\\.`, 'g'),
    // Static methods and properties
    new RegExp(`${exportedVar}\\.(?!prototype)`, 'g'),
    // In inherit/inheritAndMix calls
    new RegExp(`\\(${exportedVar},`, 'g'),
    new RegExp(`,\\s*${exportedVar}\\)`, 'g'),
    new RegExp(`,\\s*${exportedVar},`, 'g'),
    // Export statement
    new RegExp(`e\\.exports\\s*=\\s*${exportedVar}`, 'g'),
    // In arrays (mixins)
    new RegExp(`\\[${exportedVar}\\]`, 'g'),
    new RegExp(`\\[${exportedVar},`, 'g'),
    new RegExp(`,\\s*${exportedVar}\\]`, 'g'),
  ];
  
  const replacements = [
    `function ${className}(`,
    `${className}.prototype.`,
    `${className}.`,
    `(${className},`,
    `, ${className})`,
    `, ${className},`,
    `module.exports = ${className}`,
    `[${className}]`,
    `[${className},`,
    `, ${className}]`,
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    code = code.replace(patterns[i], replacements[i]);
  }
  
  // Replace require calls with proper class names
  // Pattern: i(17) -> require('./GRGBColor')
  code = code.replace(/([a-z])\((\d+)\)/g, (match, varName, modId) => {
    const reqClassName = MODULE_MAP[modId];
    if (reqClassName && varName.match(/[inr]/i)) {
      const category = getCategory(reqClassName);
      return `require('./${reqClassName}')`;
    }
    return match;
  });
  
  // Add header
  const header = `/**
 * ${className}
 * Module ID: ${moduleId}
 * 
 * Part of the Gravit Designer core engine
 * Reconstructed from minified source
 */

`;

  // Clean up and format
  code = header + code.trim() + '\n';
  
  return code;
}

async function main() {
  console.log('🔧 Gravit Designer Advanced Reconstructor');
  console.log('==========================================\n');
  
  // Create output directories
  const dirs = [
    'infinity/core', 'infinity/scene', 'infinity/geometry', 'infinity/vertex',
    'infinity/paint', 'infinity/effects', 'infinity/event', 'infinity/other',
    'editor', 'application'
  ];
  
  for (const dir of dirs) {
    await fs.ensureDir(path.join(OUTPUT_DIR, dir));
  }
  
  // Read vendor bundle
  const vendorPath = path.join(PUBLIC_DIR, 'chunk.vendor.js');
  const vendorCode = await fs.readFile(vendorPath, 'utf8');
  
  console.log(`📄 Processing vendor bundle (${(vendorCode.length / 1024 / 1024).toFixed(2)} MB)`);
  
  // Extract module functions
  console.log('🔍 Extracting webpack modules...');
  const modules = extractModuleFunctions(vendorCode);
  
  const moduleCount = Object.keys(modules).length;
  console.log(`📦 Found ${moduleCount} named modules\n`);
  
  if (moduleCount === 0) {
    console.log('❌ No modules found. Trying alternative extraction...');
    await alternativeExtraction(vendorCode);
    return;
  }
  
  // Reconstruct each module
  let reconstructed = 0;
  let failed = 0;
  
  for (const [moduleId, moduleData] of Object.entries(modules)) {
    try {
      const code = reconstructModule(moduleData.className, moduleData.code, moduleId);
      
      if (code && code.length > 200) {
        const category = getCategory(moduleData.className);
        const outputPath = path.join(OUTPUT_DIR, category, `${moduleData.className}.js`);
        
        await fs.writeFile(outputPath, code);
        reconstructed++;
        
        if (reconstructed % 20 === 0) {
          console.log(`   Reconstructed ${reconstructed} modules...`);
        }
      } else {
        failed++;
      }
    } catch (err) {
      failed++;
      // console.log(`   ⚠️ Error: ${moduleData.className}: ${err.message}`);
    }
  }
  
  console.log(`\n✅ Reconstructed ${reconstructed} modules`);
  if (failed > 0) {
    console.log(`⚠️ ${failed} modules could not be fully reconstructed`);
  }
  
  // Create index
  await createIndex();
  
  // Show output structure
  console.log('\n📁 Output structure:');
  for (const dir of dirs) {
    const dirPath = path.join(OUTPUT_DIR, dir);
    if (await fs.pathExists(dirPath)) {
      const files = await fs.readdir(dirPath);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      if (jsFiles.length > 0) {
        console.log(`   ${dir}/  - ${jsFiles.length} files`);
      }
    }
  }
}

/**
 * Alternative extraction by searching for class patterns directly
 */
async function alternativeExtraction(code) {
  console.log('📍 Using pattern-based extraction...\n');
  
  const classPatterns = [];
  
  // Find all prototype assignments that mention G* class names
  const protoPattern = /(\w+)\.prototype\.(\w+)\s*=\s*function/g;
  let match;
  
  const foundClasses = new Set();
  
  while ((match = protoPattern.exec(code)) !== null) {
    const varName = match[1];
    const methodName = match[2];
    
    // Check if this var is exported as a known class
    const pos = match.index;
    
    // Look for e.exports = varName nearby
    const nearby = code.substring(Math.max(0, pos - 5000), Math.min(code.length, pos + 5000));
    const exportMatch = nearby.match(new RegExp(`e\\.exports\\s*=\\s*${varName}\\b`));
    
    if (exportMatch) {
      // This variable is exported - check if it's in our mapping
      for (const [modId, className] of Object.entries(MODULE_MAP)) {
        if (!foundClasses.has(className)) {
          // Check if this class name appears in the nearby code
          if (nearby.includes(`[Object ${className}`)) {
            foundClasses.add(className);
            classPatterns.push({
              className,
              varName,
              position: pos
            });
          }
        }
      }
    }
  }
  
  console.log(`Found ${classPatterns.length} potential classes by pattern`);
  
  // For each class, extract its code
  let extracted = 0;
  
  for (const cls of classPatterns) {
    try {
      // Find all code related to this class variable
      const segments = [];
      
      // Find prototype methods
      const methodPattern = new RegExp(`${cls.varName}\\.prototype\\.(\\w+)\\s*=\\s*function\\s*\\([^)]*\\)\\s*\\{`, 'g');
      
      while ((match = methodPattern.exec(code)) !== null) {
        // Extract the full method
        let braceCount = 1;
        let end = match.index + match[0].length;
        
        while (end < code.length && braceCount > 0) {
          if (code[end] === '{') braceCount++;
          else if (code[end] === '}') braceCount--;
          end++;
        }
        
        segments.push(code.substring(match.index, end)
          .replace(new RegExp(`${cls.varName}\\.prototype`, 'g'), `${cls.className}.prototype`)
        );
      }
      
      if (segments.length > 0) {
        const reconstructed = `/**
 * ${cls.className}
 * Reconstructed from minified source
 */

function ${cls.className}() {
  // Constructor
}

${segments.join('\n\n')}

module.exports = ${cls.className};
`;
        
        const category = getCategory(cls.className);
        const outputPath = path.join(OUTPUT_DIR, category, `${cls.className}.js`);
        
        await fs.writeFile(outputPath, reconstructed);
        extracted++;
      }
    } catch (err) {
      // Skip errors
    }
  }
  
  console.log(`✅ Extracted ${extracted} classes via pattern matching`);
  await createIndex();
}

async function createIndex() {
  const files = [];
  
  async function scanDir(dir) {
    if (!(await fs.pathExists(dir))) return;
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
 * Auto-generated
 */

`;

  for (const file of files.sort((a, b) => a.name.localeCompare(b.name))) {
    indexContent += `exports.${file.name} = require('./${file.path}');\n`;
  }
  
  await fs.writeFile(path.join(OUTPUT_DIR, 'index.js'), indexContent);
  console.log('✅ Created index.js');
}

main().catch(console.error);
