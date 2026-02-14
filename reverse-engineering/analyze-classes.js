/**
 * Gravit Designer Reverse Engineering - Class Analyzer
 * 
 * Analyzes the minified code to extract comprehensive information about
 * all classes, their inheritance hierarchy, methods, and properties.
 * 
 * Usage: node analyze-classes.js
 */

const fs = require('fs-extra');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_DIR = path.join(__dirname, 'analysis');

async function analyze() {
  console.log('🔍 Gravit Designer Class Analyzer');
  console.log('==================================\n');
  
  await fs.ensureDir(OUTPUT_DIR);
  
  const vendorPath = path.join(PUBLIC_DIR, 'chunk.vendor.js');
  const designerPath = path.join(PUBLIC_DIR, 'designer.browser.js');
  
  const vendorCode = await fs.readFile(vendorPath, 'utf8');
  const designerCode = await fs.readFile(designerPath, 'utf8');
  
  console.log(`📄 Vendor: ${(vendorCode.length / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📄 Designer: ${(designerCode.length / 1024 / 1024).toFixed(2)} MB`);
  
  // Extract class information
  const classes = {};
  const inheritance = {};
  const mixins = {};
  const events = [];
  const constants = {};
  
  // 1. Find all GObject.inherit calls to map inheritance
  console.log('\n📊 Analyzing inheritance...');
  const inheritPattern = /GObject\.inherit\(\s*(\w+)\s*,\s*(\w+)/g;
  let match;
  
  while ((match = inheritPattern.exec(vendorCode)) !== null) {
    const [, child, parent] = match;
    inheritance[child] = parent;
    
    if (!classes[child]) classes[child] = { methods: [], properties: [], parent: null, mixins: [] };
    if (!classes[parent]) classes[parent] = { methods: [], properties: [], parent: null, mixins: [] };
    
    classes[child].parent = parent;
  }
  
  while ((match = inheritPattern.exec(designerCode)) !== null) {
    const [, child, parent] = match;
    inheritance[child] = parent;
    
    if (!classes[child]) classes[child] = { methods: [], properties: [], parent: null, mixins: [] };
    classes[child].parent = parent;
  }
  
  console.log(`   Found ${Object.keys(inheritance).length} inheritance relationships`);
  
  // 2. Find all GObject.inheritAndMix calls
  console.log('📊 Analyzing mixins...');
  const mixinPattern = /GObject\.inheritAndMix\(\s*(\w+)\s*,\s*(\w+|null)\s*,\s*\[([^\]]+)\]/g;
  
  while ((match = mixinPattern.exec(vendorCode)) !== null) {
    const [, child, parent, mixinList] = match;
    const mixinNames = mixinList.split(',').map(m => m.trim()).filter(Boolean);
    
    if (!classes[child]) classes[child] = { methods: [], properties: [], parent: null, mixins: [] };
    if (parent && parent !== 'null') classes[child].parent = parent;
    classes[child].mixins = mixinNames;
    mixins[child] = mixinNames;
  }
  
  while ((match = mixinPattern.exec(designerCode)) !== null) {
    const [, child, parent, mixinList] = match;
    const mixinNames = mixinList.split(',').map(m => m.trim()).filter(Boolean);
    
    if (!classes[child]) classes[child] = { methods: [], properties: [], parent: null, mixins: [] };
    if (parent && parent !== 'null') classes[child].parent = parent;
    classes[child].mixins = mixinNames;
    mixins[child] = mixinNames;
  }
  
  console.log(`   Found ${Object.keys(mixins).length} classes with mixins`);
  
  // 3. Find all prototype methods
  console.log('📊 Analyzing methods...');
  const methodPattern = /(\w+)\.prototype\.(\w+)\s*=/g;
  
  while ((match = methodPattern.exec(vendorCode)) !== null) {
    const [, className, methodName] = match;
    if (!classes[className]) classes[className] = { methods: [], properties: [], parent: null, mixins: [] };
    if (!classes[className].methods.includes(methodName)) {
      classes[className].methods.push(methodName);
    }
  }
  
  while ((match = methodPattern.exec(designerCode)) !== null) {
    const [, className, methodName] = match;
    if (!classes[className]) classes[className] = { methods: [], properties: [], parent: null, mixins: [] };
    if (!classes[className].methods.includes(methodName)) {
      classes[className].methods.push(methodName);
    }
  }
  
  const totalMethods = Object.values(classes).reduce((sum, c) => sum + c.methods.length, 0);
  console.log(`   Found ${totalMethods} prototype methods`);
  
  // 4. Find all static properties (constants)
  console.log('📊 Analyzing constants...');
  const staticPattern = /(\w+)\.(\w+)\s*=\s*(?:["']([^"']+)["']|(\d+)|({[^}]+}))/g;
  
  while ((match = staticPattern.exec(vendorCode)) !== null) {
    const [, className, propName, strVal, numVal, objVal] = match;
    if (className.startsWith('G') && propName !== 'prototype' && !propName.startsWith('_')) {
      if (!constants[className]) constants[className] = {};
      constants[className][propName] = strVal || numVal || objVal;
    }
  }
  
  console.log(`   Found constants for ${Object.keys(constants).length} classes`);
  
  // 5. Find all events
  console.log('📊 Analyzing events...');
  const eventPattern = /(\w+)\.(\w+Event)\s*=/g;
  
  while ((match = eventPattern.exec(vendorCode)) !== null) {
    const [, className, eventName] = match;
    events.push({ class: className, event: eventName, full: `${className}.${eventName}` });
  }
  
  while ((match = eventPattern.exec(designerCode)) !== null) {
    const [, className, eventName] = match;
    events.push({ class: className, event: eventName, full: `${className}.${eventName}` });
  }
  
  // Remove duplicates
  const uniqueEvents = [...new Set(events.map(e => e.full))].map(full => {
    const parts = full.split('.');
    return { class: parts[0], event: parts[1], full };
  });
  
  console.log(`   Found ${uniqueEvents.length} event types`);
  
  // Generate reports
  console.log('\n📝 Generating reports...');
  
  // Class hierarchy report
  const hierarchyReport = generateHierarchyReport(classes, inheritance);
  await fs.writeFile(path.join(OUTPUT_DIR, 'class-hierarchy.md'), hierarchyReport);
  console.log('   ✅ class-hierarchy.md');
  
  // Methods report
  const methodsReport = generateMethodsReport(classes);
  await fs.writeFile(path.join(OUTPUT_DIR, 'class-methods.json'), JSON.stringify(classes, null, 2));
  console.log('   ✅ class-methods.json');
  
  // Events report
  await fs.writeFile(path.join(OUTPUT_DIR, 'events.json'), JSON.stringify(uniqueEvents, null, 2));
  console.log('   ✅ events.json');
  
  // Constants report
  await fs.writeFile(path.join(OUTPUT_DIR, 'constants.json'), JSON.stringify(constants, null, 2));
  console.log('   ✅ constants.json');
  
  // Summary
  const summary = {
    totalClasses: Object.keys(classes).length,
    totalMethods: totalMethods,
    totalEvents: uniqueEvents.length,
    classesWithMixins: Object.keys(mixins).length,
    coreClasses: Object.keys(classes).filter(c => c.startsWith('G') && !c.includes('GL')).length,
    editorClasses: Object.keys(classes).filter(c => c.includes('Editor')).length,
    effectClasses: Object.keys(classes).filter(c => c.includes('Effect')).length,
    annotationClasses: Object.keys(classes).filter(c => c.includes('Annotation')).length,
  };
  
  await fs.writeFile(path.join(OUTPUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log('   ✅ summary.json');
  
  console.log('\n📊 Summary:');
  console.log(`   Total classes: ${summary.totalClasses}`);
  console.log(`   Total methods: ${summary.totalMethods}`);
  console.log(`   Total events: ${summary.totalEvents}`);
  console.log(`   Core classes (G*): ${summary.coreClasses}`);
  console.log(`   Editor classes: ${summary.editorClasses}`);
  console.log(`   Effect classes: ${summary.effectClasses}`);
  
  console.log('\n✅ Analysis complete! Reports saved to:', OUTPUT_DIR);
}

function generateHierarchyReport(classes, inheritance) {
  let report = `# Gravit Designer Class Hierarchy

Generated by the reverse engineering toolkit.

## Inheritance Tree

`;

  // Find root classes (no parent or parent is GObject)
  const roots = Object.keys(classes).filter(c => {
    const parent = classes[c].parent;
    return !parent || parent === 'GObject';
  });
  
  // Build tree recursively
  function buildTree(className, indent = 0) {
    const prefix = '  '.repeat(indent) + (indent > 0 ? '├── ' : '');
    let tree = prefix + className;
    
    const cls = classes[className];
    if (cls && cls.mixins && cls.mixins.length > 0) {
      tree += ` [+ ${cls.mixins.join(', ')}]`;
    }
    
    tree += '\n';
    
    // Find children
    const children = Object.keys(inheritance).filter(c => inheritance[c] === className);
    children.sort();
    
    for (const child of children) {
      tree += buildTree(child, indent + 1);
    }
    
    return tree;
  }
  
  report += '```\nGObject\n';
  
  // Get direct children of GObject
  const gobjectChildren = Object.keys(inheritance).filter(c => inheritance[c] === 'GObject');
  gobjectChildren.sort();
  
  for (const child of gobjectChildren) {
    report += buildTree(child, 1);
  }
  
  report += '```\n\n';
  
  // Add method counts
  report += `## Classes by Method Count

| Class | Methods | Parent | Mixins |
|-------|---------|--------|--------|
`;

  const sorted = Object.entries(classes)
    .sort((a, b) => b[1].methods.length - a[1].methods.length)
    .slice(0, 50);
  
  for (const [name, cls] of sorted) {
    const mixinStr = cls.mixins ? cls.mixins.join(', ') : '';
    report += `| ${name} | ${cls.methods.length} | ${cls.parent || '-'} | ${mixinStr || '-'} |\n`;
  }
  
  return report;
}

function generateMethodsReport(classes) {
  let report = `# Gravit Designer Methods Reference

`;

  const sorted = Object.entries(classes)
    .filter(([name, cls]) => cls.methods.length > 0)
    .sort((a, b) => a[0].localeCompare(b[0]));
  
  for (const [name, cls] of sorted) {
    report += `## ${name}\n\n`;
    if (cls.parent) report += `Extends: ${cls.parent}\n\n`;
    if (cls.mixins && cls.mixins.length > 0) {
      report += `Mixins: ${cls.mixins.join(', ')}\n\n`;
    }
    
    report += `Methods:\n`;
    for (const method of cls.methods.slice(0, 30).sort()) {
      report += `- ${method}\n`;
    }
    if (cls.methods.length > 30) {
      report += `- ... and ${cls.methods.length - 30} more\n`;
    }
    report += '\n';
  }
  
  return report;
}

analyze().catch(console.error);
