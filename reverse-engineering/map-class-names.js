/**
 * Gravit Designer Reverse Engineering - Class Name Mapper
 * 
 * This script extracts class names from toString() methods in the minified code.
 * Many classes have toString() methods that return "[Object ClassName]" which
 * reveals their actual class name.
 * 
 * Usage: node map-class-names.js
 */

const fs = require('fs-extra');
const path = require('path');

const BEAUTIFIED_DIR = path.join(__dirname, 'beautified');
const OUTPUT_DIR = path.join(__dirname, 'analysis');

async function mapClassNames() {
  console.log('🔍 Gravit Designer Class Name Mapper');
  console.log('=====================================\n');
  
  await fs.ensureDir(OUTPUT_DIR);
  
  const vendorPath = path.join(BEAUTIFIED_DIR, 'chunk.vendor.js');
  const designerPath = path.join(BEAUTIFIED_DIR, 'designer.browser.js');
  
  if (!(await fs.pathExists(vendorPath))) {
    console.log('❌ Beautified code not found. Run beautify.js first.');
    return;
  }
  
  const vendorCode = await fs.readFile(vendorPath, 'utf8');
  
  console.log(`📄 Processing vendor bundle (${(vendorCode.length / 1024 / 1024).toFixed(2)} MB)`);
  
  // Find toString methods that return class names
  const classMap = {};
  
  // Pattern: .prototype.toString = function() { return "[Object ClassName]" }
  const toStringPattern = /(\w+)\.prototype\.toString\s*=\s*function\s*\([^)]*\)\s*\{[^}]*return\s*["']\[Object\s+(\w+)\]["'][^}]*\}/g;
  
  let match;
  while ((match = toStringPattern.exec(vendorCode)) !== null) {
    const [, varName, className] = match;
    classMap[className] = {
      minifiedVar: varName,
      position: match.index,
      source: 'vendor'
    };
  }
  
  console.log(`   Found ${Object.keys(classMap).length} classes in vendor\n`);
  
  // Process designer bundle
  if (await fs.pathExists(designerPath)) {
    const designerCode = await fs.readFile(designerPath, 'utf8');
    console.log(`📄 Processing designer bundle (${(designerCode.length / 1024 / 1024).toFixed(2)} MB)`);
    
    while ((match = toStringPattern.exec(designerCode)) !== null) {
      const [, varName, className] = match;
      if (!classMap[className]) {
        classMap[className] = {
          minifiedVar: varName,
          position: match.index,
          source: 'designer'
        };
      }
    }
    
    console.log(`   Total classes found: ${Object.keys(classMap).length}\n`);
  }
  
  // Also look for GObject.inherit patterns with names
  console.log('📊 Looking for additional patterns...');
  
  // Pattern: getTypeId() returns a name
  const typeIdPattern = /(\w+)\.getTypeId\s*\([^)]*\)\s*\{[^}]*return\s*["'](\w+)["']/g;
  
  while ((match = typeIdPattern.exec(vendorCode)) !== null) {
    const [, varName, typeName] = match;
    if (!classMap[typeName]) {
      classMap[typeName] = {
        minifiedVar: varName,
        position: match.index,
        source: 'vendor',
        method: 'getTypeId'
      };
    }
  }
  
  // Extract module information
  console.log('\n📊 Extracting module exports...');
  
  const moduleExports = {};
  
  // Find e.exports = varName patterns near class definitions
  const exportPattern = /e\.exports\s*=\s*(\w+)/g;
  
  while ((match = exportPattern.exec(vendorCode)) !== null) {
    const [, exportedVar] = match;
    
    // Look back to find the toString for this variable
    for (const [className, info] of Object.entries(classMap)) {
      if (info.minifiedVar === exportedVar) {
        moduleExports[className] = {
          exportPosition: match.index,
          moduleId: findModuleId(vendorCode, match.index)
        };
        break;
      }
    }
  }
  
  // Correlate with existing module map
  let moduleMap = {};
  try {
    moduleMap = require('./extracted-modules/module-map.json');
  } catch (e) {}
  
  // Create reverse lookup
  const moduleToClass = {};
  for (const [id, name] of Object.entries(moduleMap)) {
    moduleToClass[name] = parseInt(id, 10);
  }
  
  // Generate comprehensive class report
  const report = {
    totalClasses: Object.keys(classMap).length,
    classes: {},
    categories: {
      core: [],
      scene: [],
      geometry: [],
      effects: [],
      rendering: [],
      text: [],
      annotations: [],
      editor: [],
      tools: [],
      other: []
    }
  };
  
  for (const [className, info] of Object.entries(classMap)) {
    const moduleId = moduleToClass[className];
    
    report.classes[className] = {
      ...info,
      moduleId: moduleId || null,
      category: getCategory(className)
    };
    
    const cat = getCategory(className);
    if (report.categories[cat]) {
      report.categories[cat].push(className);
    } else {
      report.categories.other.push(className);
    }
  }
  
  // Save reports
  await fs.writeJson(path.join(OUTPUT_DIR, 'class-map.json'), report, { spaces: 2 });
  console.log('✅ Saved class-map.json');
  
  // Generate markdown report
  let markdown = `# Gravit Designer Class Map

Generated automatically by analyzing toString() methods.

## Summary

- Total classes found: ${report.totalClasses}
- Core classes: ${report.categories.core.length}
- Scene classes: ${report.categories.scene.length}
- Geometry classes: ${report.categories.geometry.length}
- Effect classes: ${report.categories.effects.length}
- Rendering classes: ${report.categories.rendering.length}
- Text classes: ${report.categories.text.length}
- Editor classes: ${report.categories.editor.length}
- Tools: ${report.categories.tools.length}

## Classes by Category

`;

  for (const [cat, classes] of Object.entries(report.categories)) {
    if (classes.length === 0) continue;
    
    markdown += `### ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n\n`;
    markdown += `| Class Name | Module ID | Minified Var |\n`;
    markdown += `|------------|-----------|-------------|\n`;
    
    for (const className of classes.sort()) {
      const info = report.classes[className];
      markdown += `| ${className} | ${info.moduleId || '-'} | ${info.minifiedVar} |\n`;
    }
    
    markdown += '\n';
  }
  
  await fs.writeFile(path.join(OUTPUT_DIR, 'class-map.md'), markdown);
  console.log('✅ Saved class-map.md');
  
  console.log('\n📊 Summary:');
  for (const [cat, classes] of Object.entries(report.categories)) {
    if (classes.length > 0) {
      console.log(`   ${cat}: ${classes.length} classes`);
    }
  }
}

function getCategory(className) {
  if (!className) return 'other';
  
  if (className.match(/^G?(Object|Node|Event|EventTarget|Locale|Util|Math|System)/)) return 'core';
  if (className.match(/Scene|Element|Layer|Page|Group|Block|Item|Symbol|Stylable|Style|Swatch|Background/)) return 'scene';
  if (className.match(/Point|Rect|Transform|Path|Vertex|Shape|Polygon|Ellipse|Rectangle|Compound|Connector|Slice|SimpleShape/)) return 'geometry';
  if (className.match(/Effect|Shadow|Blur|Glow|Mirror/)) return 'effects';
  if (className.match(/Paint|Renderer|Canvas|Color|Gradient|Pattern|Bitmap|Image|WebGL|Hit/)) return 'rendering';
  if (className.match(/Text|Font|OpenType|TL|Collab/)) return 'text';
  if (className.match(/Annotation|Comment/)) return 'annotations';
  if (className.match(/Editor|Manager|Handler|View|Panel|Dialog/)) return 'editor';
  if (className.match(/Tool/)) return 'tools';
  
  return 'other';
}

function findModuleId(code, position) {
  // This is a simplified heuristic - look backwards for module boundary
  // Webpack modules typically start with function(e, t, i) {
  const moduleStart = code.lastIndexOf('function (e, t', position);
  if (moduleStart === -1) return null;
  
  // Count modules from start
  const beforeModule = code.slice(0, moduleStart);
  const moduleCount = (beforeModule.match(/function \(e, t/g) || []).length;
  
  return moduleCount;
}

mapClassNames().catch(console.error);
