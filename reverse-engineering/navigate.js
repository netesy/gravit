/**
 * Gravit Designer Code Navigator
 * 
 * Interactive tool to search and navigate the codebase
 * using knowledge from both old and new sources.
 * 
 * Usage: node navigate.js <search-term>
 * 
 * Examples:
 *   node navigate.js GScene
 *   node navigate.js getBBox
 *   node navigate.js ModifiedEvent
 */

const fs = require('fs-extra');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OLD_SRC = path.join(__dirname, '..', '..', 'gravit-original', 'src');

// Load the module map
let MODULE_MAP;
try {
  MODULE_MAP = require('./extracted-modules/module-map.json');
} catch (e) {
  console.log('⚠️ Module map not found. Run: node extract-modules.js first');
  MODULE_MAP = {};
}

async function navigate(searchTerm) {
  if (!searchTerm) {
    console.log('Usage: node navigate.js <search-term>');
    console.log('\nExamples:');
    console.log('  node navigate.js GScene       - Find the GScene class');
    console.log('  node navigate.js getBBox      - Find getBBox method');
    console.log('  node navigate.js paint        - Find paint-related code');
    return;
  }

  console.log(`🔍 Searching for: "${searchTerm}"\n`);

  // Check if it's a known class name
  const moduleId = Object.entries(MODULE_MAP).find(([id, name]) => 
    name.toLowerCase() === searchTerm.toLowerCase()
  );
  
  if (moduleId) {
    console.log(`📦 Found as class: ${moduleId[1]} (Module ID: ${moduleId[0]})\n`);
    console.log(`   In minified code, look for: n(${moduleId[0]}) or i(${moduleId[0]})`);
    console.log(`   Or search for: ${moduleId[1]}.prototype.`);
  }

  // Search in the new minified code
  console.log('\n📄 Searching in minified code...\n');
  
  const vendorPath = path.join(PUBLIC_DIR, 'chunk.vendor.js');
  const designerPath = path.join(PUBLIC_DIR, 'designer.browser.js');
  
  const vendorCode = await fs.readFile(vendorPath, 'utf8');
  const designerCode = await fs.readFile(designerPath, 'utf8');
  
  // Find matches in vendor
  const vendorMatches = findMatches(vendorCode, searchTerm, 'chunk.vendor.js');
  const designerMatches = findMatches(designerCode, searchTerm, 'designer.browser.js');
  
  console.log(`   chunk.vendor.js: ${vendorMatches.length} matches`);
  console.log(`   designer.browser.js: ${designerMatches.length} matches`);
  
  // Show sample matches
  if (vendorMatches.length > 0) {
    console.log('\n📍 Sample matches from chunk.vendor.js:\n');
    vendorMatches.slice(0, 5).forEach((match, i) => {
      console.log(`   ${i + 1}. Line ${match.line}:`);
      console.log(`      ${match.context.trim().substring(0, 100)}...`);
    });
    if (vendorMatches.length > 5) {
      console.log(`\n   ... and ${vendorMatches.length - 5} more matches`);
    }
  }
  
  // Search in old source
  if (await fs.pathExists(OLD_SRC)) {
    console.log('\n📚 Searching in original source...\n');
    const oldMatches = await searchOldSource(searchTerm);
    
    if (oldMatches.length > 0) {
      console.log(`   Found in ${oldMatches.length} original files:\n`);
      oldMatches.slice(0, 5).forEach(match => {
        console.log(`   📄 ${match.file}`);
        console.log(`      Line ${match.line}: ${match.context.substring(0, 80)}...`);
      });
    }
  }
  
  // Provide helpful suggestions
  console.log('\n💡 Tips:');
  console.log(`   - Search for "${searchTerm}.prototype." to find methods`);
  console.log(`   - Search for "inherit(${searchTerm}" to find inheritance`);
  console.log(`   - Search for "${searchTerm}Event" to find related events`);
}

function findMatches(code, searchTerm, filename) {
  const matches = [];
  const lines = code.split('\n');
  const regex = new RegExp(escapeRegex(searchTerm), 'gi');
  
  lines.forEach((line, index) => {
    if (regex.test(line)) {
      matches.push({
        file: filename,
        line: index + 1,
        context: line
      });
    }
  });
  
  return matches;
}

async function searchOldSource(searchTerm) {
  const matches = [];
  const files = await getJsFiles(OLD_SRC);
  const regex = new RegExp(escapeRegex(searchTerm), 'gi');
  
  for (const file of files) {
    const code = await fs.readFile(file, 'utf8');
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        matches.push({
          file: path.relative(OLD_SRC, file),
          line: index + 1,
          context: line.trim()
        });
      }
    });
  }
  
  return matches;
}

async function getJsFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      files.push(...await getJsFiles(fullPath));
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Run with command line argument
const searchTerm = process.argv[2];
navigate(searchTerm).catch(console.error);
