/**
 * Gravit Designer Reverse Engineering - Source Comparator
 * 
 * Compares the old open-source Gravit with the new minified version
 * to help understand what has changed and assist with reverse engineering.
 * 
 * Usage: node compare-sources.js
 */

const fs = require('fs-extra');
const path = require('path');

const OLD_SRC = path.join(__dirname, '..', '..', 'gravit-original', 'src');
const NEW_SRC = path.join(__dirname, '..', 'public');
const OUTPUT_DIR = path.join(__dirname, 'comparison');

// Class name evolution: Old (IF*) -> New (G*)
const CLASS_EVOLUTION = {
  // Core
  'IFObject': { new: 'GObject', module: 0, file: 'infinity/core/object.js' },
  'IFNode': { new: 'GNode', module: 2, file: 'infinity/scene/node.js' },
  'IFMath': { new: 'GMath', module: 12, file: 'infinity/core/math.js' },
  'IFUtil': { new: 'GUtil', module: 11, file: 'infinity/core/util.js' },
  'IFLocale': { new: 'GLocale', module: 9, file: 'infinity/i18n/locale.js' },
  
  // Geometry
  'IFPoint': { new: 'GPoint', module: 5, file: 'infinity/geometry/point.js' },
  'IFRect': { new: 'GRect', module: 6, file: 'infinity/geometry/rect.js' },
  'IFTransform': { new: 'GTransform', module: 7, file: 'infinity/geometry/transform.js' },
  'IFVertex': { new: 'GVertex', module: 48, file: 'infinity/vertex/vertex.js' },
  'IFVertexSource': { new: 'GVertexSource', module: 87, file: 'infinity/vertex/vertexsource.js' },
  'IFVertexContainer': { new: 'GVertexContainer', module: 54, file: 'infinity/vertex/vertexcontainer.js' },
  'IFVertexTransformer': { new: 'GVertexTransformer', module: 63, file: 'infinity/vertex/vertextransformer.js' },
  
  // Scene
  'IFScene': { new: 'GScene', module: 160, file: 'infinity/scene/scene.js' },
  'IFElement': { new: 'GElement', module: 22, file: 'infinity/scene/element.js' },
  'IFBlock': { new: 'GBlock', module: 69, file: 'infinity/scene/block.js' },
  'IFItem': { new: 'GItem', module: 104, file: 'infinity/scene/item.js' },
  'IFShape': { new: 'GShape', module: 56, file: 'infinity/scene/shape/shape.js' },
  'IFPath': { new: 'GPath', module: 60, file: 'infinity/scene/shape/path.js' },
  'IFRectangle': { new: 'GRectangle', module: 73, file: 'infinity/scene/shape/rectangle.js' },
  'IFEllipse': { new: 'GEllipse', module: 214, file: 'infinity/scene/shape/ellipse.js' },
  'IFPolygon': { new: 'GPolygon', module: 284, file: 'infinity/scene/shape/polygon.js' },
  'IFText': { new: 'GText', module: 70, file: 'infinity/scene/shape/text.js' },
  'IFImage': { new: 'GImage', module: 95, file: 'infinity/scene/shape/image.js' },
  'IFLayer': { new: 'GLayer', module: 159, file: 'infinity/scene/structure/layer.js' },
  'IFPage': { new: 'GPage', module: 83, file: 'infinity/scene/structure/page.js' },
  'IFGroup': { new: 'GGroup', module: 122, file: 'infinity/scene/shape/group.js' },
  
  // Style
  'IFStylable': { new: 'GStylable', module: 28, file: 'infinity/scene/style/stylable.js' },
  'IFStyle': { new: 'GStyle', module: 511, file: 'infinity/scene/style/style.js' },
  'IFPattern': { new: 'GPattern', module: 50, file: 'infinity/paint/pattern.js' },
  'IFGradient': { new: 'GGradient', module: 138, file: 'infinity/paint/gradient.js' },
  'IFColor': { new: 'GColor', module: 68, file: 'infinity/paint/color.js' },
  
  // Paint
  'IFPaintCanvas': { new: 'GPaintCanvas', module: 14, file: 'infinity/paint/paintcanvas.js' },
  'IFPaintContext': { new: 'GPaintContext', module: 228, file: 'infinity/paint/paintcontext.js' },
  
  // Events
  'GEvent': { new: 'GEvent', module: 72, file: 'infinity/event/event.js' },
  'GEventTarget': { new: 'GEventTarget', module: 75, file: 'infinity/event/eventtarget.js' },
  
  // Platform
  'GUIPlatform': { new: 'GPlatform', module: null, file: 'infinity/platform.js' },
};

// Methods that are commonly found in both versions
const COMMON_METHODS = {
  'GObject': ['inherit', 'inheritAndMix', 'mix', 'getTypeId', 'getName', 'hasMixin'],
  'GNode': ['getParent', 'getFirstChild', 'getLastChild', 'getNext', 'getPrevious', 'appendChild', 'removeChild', 'insertBefore'],
  'GElement': ['transform', 'getBBox', 'paint', 'hitTest'],
  'GScene': ['getActivePage', 'getPages', 'paint'],
  'GPath': ['getAnchorPoints', 'addPoint', 'rewindVertices', 'close'],
  'GPaintCanvas': ['fillRect', 'strokeRect', 'beginPath', 'moveTo', 'lineTo', 'fill', 'stroke'],
};

async function compare() {
  console.log('🔍 Gravit Designer Source Comparator');
  console.log('=====================================\n');
  
  await fs.ensureDir(OUTPUT_DIR);
  
  // Check if old source exists
  if (!(await fs.pathExists(OLD_SRC))) {
    console.log('❌ Old source not found at:', OLD_SRC);
    console.log('   Please clone: git clone https://github.com/OliBridgman/gravit gravit-original');
    return;
  }
  
  console.log('📂 Old source:', OLD_SRC);
  console.log('📂 New source:', NEW_SRC);
  
  // Analyze old source structure
  console.log('\n📊 Analyzing old source structure...');
  const oldFiles = await getJsFiles(OLD_SRC);
  console.log(`   Found ${oldFiles.length} JavaScript files`);
  
  // Extract class definitions from old source
  console.log('\n🔎 Extracting class definitions from old source...');
  const oldClasses = await extractOldClasses(oldFiles);
  console.log(`   Found ${Object.keys(oldClasses).length} classes`);
  
  // Save comparison report
  const report = generateReport(oldClasses);
  const reportPath = path.join(OUTPUT_DIR, 'comparison-report.md');
  await fs.writeFile(reportPath, report);
  console.log(`\n✅ Comparison report saved to: ${reportPath}`);
  
  // Save class evolution map
  const evolutionPath = path.join(OUTPUT_DIR, 'class-evolution.json');
  await fs.writeJson(evolutionPath, CLASS_EVOLUTION, { spaces: 2 });
  console.log(`✅ Class evolution map saved to: ${evolutionPath}`);
  
  // Save common methods map
  const methodsPath = path.join(OUTPUT_DIR, 'common-methods.json');
  await fs.writeJson(methodsPath, COMMON_METHODS, { spaces: 2 });
  console.log(`✅ Common methods map saved to: ${methodsPath}`);
  
  console.log('\n💡 How to use this comparison:');
  console.log('   1. Look up a class in class-evolution.json to find its module ID');
  console.log('   2. Read the original source file to understand the logic');
  console.log('   3. Search for method names in the minified code');
  console.log('   4. Use the module ID to locate the code in chunk.vendor.js');
}

async function getJsFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getJsFiles(fullPath));
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function extractOldClasses(files) {
  const classes = {};
  
  for (const file of files) {
    const code = await fs.readFile(file, 'utf8');
    const relativePath = path.relative(OLD_SRC, file);
    
    // Find function declarations that look like classes
    const classPattern = /function\s+(IF\w+|GU\w+|G\w+)\s*\(/g;
    let match;
    
    while ((match = classPattern.exec(code)) !== null) {
      const className = match[1];
      if (!classes[className]) {
        classes[className] = {
          file: relativePath,
          methods: []
        };
        
        // Find prototype methods
        const methodPattern = new RegExp(`${className}\\.prototype\\.(\\w+)\\s*=`, 'g');
        let methodMatch;
        while ((methodMatch = methodPattern.exec(code)) !== null) {
          classes[className].methods.push(methodMatch[1]);
        }
      }
    }
  }
  
  return classes;
}

function generateReport(oldClasses) {
  let report = `# Gravit Designer - Reverse Engineering Comparison Report

Generated: ${new Date().toISOString()}

## Overview

This report compares the old open-source Gravit (circa 2013-2014) with the current
minified version. The goal is to help understand the code structure and assist
with reverse engineering efforts.

## Key Changes

### Naming Convention
- Old: \`IF*\` prefix for Infinity classes (e.g., \`IFObject\`, \`IFScene\`)
- New: \`G*\` prefix (e.g., \`GObject\`, \`GScene\`)

### Build System
- Old: Grunt + Bower + concatenation
- New: Webpack + NPM + bundling/minification

### Code Structure
- Old: Global namespace with \`_\` (underscore) wrapper
- New: CommonJS modules with webpack runtime

## Class Mapping

| Old Class | New Class | Module ID | Original File |
|-----------|-----------|-----------|---------------|
`;

  for (const [oldName, info] of Object.entries(CLASS_EVOLUTION)) {
    report += `| ${oldName} | ${info.new} | ${info.module || 'N/A'} | ${info.file} |\n`;
  }

  report += `

## Old Classes Found

`;

  for (const [className, info] of Object.entries(oldClasses).slice(0, 50)) {
    report += `### ${className}
- File: \`${info.file}\`
- Methods: ${info.methods.slice(0, 10).join(', ')}${info.methods.length > 10 ? '...' : ''}

`;
  }

  report += `
## Tips for Reverse Engineering

1. **String Search**: Method names and property names are preserved in the minified code.
   Search for specific method names like \`getBBox\`, \`transform\`, \`paint\`.

2. **Module Dependencies**: The \`n(X)\` calls in the minified code reference other modules.
   Use the module map to understand what's being imported.

3. **Prototype Chains**: Look for \`GObject.inherit(X, Y)\` to understand class hierarchies.

4. **Event Names**: Event class names like \`GEditor.ModifiedEvent\` are preserved.

5. **Property Names**: Properties starting with \`@\` or \`_\` are often instance variables.

## Useful Searches

\`\`\`
# Find class inheritance
GObject.inherit

# Find mixin usage
GObject.inheritAndMix

# Find event registrations
addEventListener

# Find property definitions
.prototype.

# Find specific features
GPaintCanvas
GScene
GEditor
\`\`\`
`;

  return report;
}

compare().catch(console.error);
