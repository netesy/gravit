/**
 * Gravit Designer Reverse Engineering Toolkit
 * 
 * Main entry point that exports all toolkit functionality.
 */

const path = require('path');

// Tool paths
const TOOLS = {
  beautify: path.join(__dirname, 'beautify.js'),
  extractModules: path.join(__dirname, 'extract-modules.js'),
  unbundle: path.join(__dirname, 'unbundle.js'),
  analyzClasses: path.join(__dirname, 'analyze-classes.js'),
  reconstructSource: path.join(__dirname, 'reconstruct-source.js'),
  renameVariables: path.join(__dirname, 'rename-variables.js'),
  compareSources: path.join(__dirname, 'compare-sources.js'),
  buildAll: path.join(__dirname, 'build-all.js'),
};

// Output directories
const OUTPUT_DIRS = {
  beautified: path.join(__dirname, 'beautified'),
  extractedModules: path.join(__dirname, 'extracted-modules'),
  modules: path.join(__dirname, 'modules'),
  analysis: path.join(__dirname, 'analysis'),
  reconstructed: path.join(__dirname, 'reconstructed'),
  renamed: path.join(__dirname, 'renamed'),
  comparison: path.join(__dirname, 'comparison'),
};

// Source directories
const SOURCE_DIRS = {
  public: path.join(__dirname, '..', 'public'),
  original: path.join(__dirname, '..', '..', 'gravit-original', 'src'),
};

// Load module map if available
let moduleMap = {};
try {
  moduleMap = require('./extracted-modules/module-map.json');
} catch (e) {
  // Not extracted yet
}

module.exports = {
  TOOLS,
  OUTPUT_DIRS,
  SOURCE_DIRS,
  moduleMap,
  
  /**
   * Get the path for a specific tool
   */
  getToolPath(name) {
    return TOOLS[name] || null;
  },
  
  /**
   * Get the class name for a module ID
   */
  getClassName(moduleId) {
    return moduleMap[moduleId.toString()] || null;
  },
  
  /**
   * Get the module ID for a class name
   */
  getModuleId(className) {
    for (const [id, name] of Object.entries(moduleMap)) {
      if (name === className) return parseInt(id, 10);
    }
    return null;
  },
  
  /**
   * List all known classes
   */
  listClasses() {
    return Object.values(moduleMap);
  },
  
  /**
   * List all module IDs
   */  
  listModuleIds() {
    return Object.keys(moduleMap).map(id => parseInt(id, 10));
  }
};
