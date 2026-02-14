/**
 * Gravit Designer Reverse Engineering - Debug Helper
 * 
 * This script provides runtime debugging utilities for inspecting
 * and modifying the Gravit Designer application.
 * 
 * Include this in your browser console or inject into the page.
 */

(function() {
  'use strict';
  
  // Check if already loaded
  if (window.GravitDebug) {
    console.log('GravitDebug already loaded');
    return;
  }
  
  const GravitDebug = {
    version: '1.0.0',
    
    /**
     * Get access to the main Gravit Designer application
     */
    getApp() {
      if (typeof gravit !== 'undefined') return gravit;
      if (typeof GravitDesigner !== 'undefined') return GravitDesigner;
      if (typeof window.app !== 'undefined') return window.app;
      
      // Try to find it in the global scope
      for (const key of Object.keys(window)) {
        if (key.toLowerCase().includes('gravit') && typeof window[key] === 'object') {
          return window[key];
        }
      }
      
      console.warn('Could not find Gravit application');
      return null;
    },
    
    /**
     * Get the current scene/document
     */
    getScene() {
      const app = this.getApp();
      if (!app) return null;
      
      // Try common property names
      const candidates = ['scene', 'document', 'doc', 'currentDocument', 'activeDocument'];
      
      for (const name of candidates) {
        if (app[name]) return app[name];
      }
      
      // Search deeper
      for (const key of Object.keys(app)) {
        const val = app[key];
        if (val && typeof val === 'object' && val.constructor && 
            val.constructor.name && val.constructor.name.includes('Scene')) {
          return val;
        }
      }
      
      return null;
    },
    
    /**
     * Get the current editor
     */
    getEditor() {
      const app = this.getApp();
      if (!app) return null;
      
      const candidates = ['editor', 'activeEditor', 'documentEditor'];
      
      for (const name of candidates) {
        if (app[name]) return app[name];
      }
      
      return null;
    },
    
    /**
     * List all classes that start with 'G'
     */
    listGClasses() {
      const classes = {};
      
      // Check window for G* constructors
      for (const key of Object.keys(window)) {
        if (key.startsWith('G') && typeof window[key] === 'function') {
          classes[key] = {
            name: key,
            prototype: Object.keys(window[key].prototype || {}).length,
            static: Object.keys(window[key]).filter(k => !['length', 'name', 'prototype'].includes(k)).length
          };
        }
      }
      
      console.table(classes);
      return classes;
    },
    
    /**
     * Inspect a class's methods
     */
    inspectClass(className) {
      let cls;
      
      if (typeof className === 'string') {
        cls = window[className];
      } else {
        cls = className;
      }
      
      if (!cls) {
        console.error('Class not found:', className);
        return null;
      }
      
      const info = {
        name: cls.name || className,
        staticMethods: [],
        staticProperties: [],
        prototypeMethods: [],
        prototypeProperties: [],
        parent: null
      };
      
      // Static members
      for (const key of Object.keys(cls)) {
        if (['length', 'name', 'prototype', 'arguments', 'caller'].includes(key)) continue;
        
        if (typeof cls[key] === 'function') {
          info.staticMethods.push(key);
        } else {
          info.staticProperties.push({ name: key, value: cls[key] });
        }
      }
      
      // Prototype members
      if (cls.prototype) {
        for (const key of Object.keys(cls.prototype)) {
          if (key === 'constructor') continue;
          
          if (typeof cls.prototype[key] === 'function') {
            info.prototypeMethods.push(key);
          } else {
            info.prototypeProperties.push(key);
          }
        }
        
        // Find parent
        const proto = Object.getPrototypeOf(cls.prototype);
        if (proto && proto.constructor && proto.constructor.name !== 'Object') {
          info.parent = proto.constructor.name;
        }
      }
      
      console.log('='.repeat(50));
      console.log(`Class: ${info.name}`);
      if (info.parent) console.log(`Extends: ${info.parent}`);
      console.log('='.repeat(50));
      
      if (info.staticMethods.length > 0) {
        console.log('\nStatic Methods:');
        info.staticMethods.forEach(m => console.log(`  ${m}()`));
      }
      
      if (info.staticProperties.length > 0) {
        console.log('\nStatic Properties:');
        info.staticProperties.forEach(p => console.log(`  ${p.name} = ${JSON.stringify(p.value)}`));
      }
      
      if (info.prototypeMethods.length > 0) {
        console.log('\nInstance Methods:');
        info.prototypeMethods.forEach(m => console.log(`  ${m}()`));
      }
      
      return info;
    },
    
    /**
     * Find all elements in the scene
     */
    findElements(type) {
      const scene = this.getScene();
      if (!scene) {
        console.error('No scene found');
        return [];
      }
      
      const elements = [];
      
      function traverse(node, depth = 0) {
        if (!node) return;
        
        const nodeType = node.constructor ? node.constructor.name : typeof node;
        
        if (!type || nodeType.includes(type)) {
          elements.push({
            node,
            type: nodeType,
            depth
          });
        }
        
        // Traverse children
        if (typeof node.getFirstChild === 'function') {
          let child = node.getFirstChild();
          while (child) {
            traverse(child, depth + 1);
            child = typeof child.getNext === 'function' ? child.getNext() : null;
          }
        }
      }
      
      traverse(scene);
      
      console.log(`Found ${elements.length} elements${type ? ` matching "${type}"` : ''}`);
      console.table(elements.slice(0, 20).map(e => ({
        type: e.type,
        depth: e.depth
      })));
      
      return elements;
    },
    
    /**
     * Get element bounding box
     */
    getBBox(element) {
      if (!element) {
        console.error('No element provided');
        return null;
      }
      
      if (typeof element.getBBox === 'function') {
        const bbox = element.getBBox();
        console.log('Bounding Box:', bbox);
        return bbox;
      }
      
      if (typeof element.getGeometryBBox === 'function') {
        const bbox = element.getGeometryBBox();
        console.log('Geometry Bounding Box:', bbox);
        return bbox;
      }
      
      console.warn('Element does not have getBBox method');
      return null;
    },
    
    /**
     * Trace method calls on an object
     */
    trace(obj, methodName) {
      if (!obj || !methodName) {
        console.error('Usage: GravitDebug.trace(object, "methodName")');
        return;
      }
      
      const original = obj[methodName];
      if (typeof original !== 'function') {
        console.error(`${methodName} is not a function`);
        return;
      }
      
      obj[methodName] = function(...args) {
        console.log(`📞 ${obj.constructor?.name || 'Object'}.${methodName}(`, args, ')');
        const result = original.apply(this, args);
        console.log(`📤 ${methodName} returned:`, result);
        return result;
      };
      
      console.log(`✅ Now tracing ${methodName}`);
      
      return () => {
        obj[methodName] = original;
        console.log(`❌ Stopped tracing ${methodName}`);
      };
    },
    
    /**
     * Hook into prototype method
     */
    hookPrototype(className, methodName, callback) {
      const cls = window[className];
      if (!cls || !cls.prototype) {
        console.error(`Class ${className} not found`);
        return;
      }
      
      const original = cls.prototype[methodName];
      if (typeof original !== 'function') {
        console.error(`${methodName} is not a method of ${className}`);
        return;
      }
      
      cls.prototype[methodName] = function(...args) {
        try {
          callback(this, args, original);
        } catch (e) {
          console.error('Hook error:', e);
        }
        return original.apply(this, args);
      };
      
      console.log(`✅ Hooked ${className}.prototype.${methodName}`);
      
      return () => {
        cls.prototype[methodName] = original;
        console.log(`❌ Unhooked ${className}.prototype.${methodName}`);
      };
    },
    
    /**
     * Create a simple test shape
     */
    createTestShape(type = 'rectangle', props = {}) {
      const scene = this.getScene();
      if (!scene) {
        console.error('No scene available');
        return null;
      }
      
      const defaults = {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: '#7eb36a'
      };
      
      const config = { ...defaults, ...props };
      
      let shape = null;
      
      switch (type.toLowerCase()) {
        case 'rectangle':
          if (window.GRectangle) {
            shape = new window.GRectangle();
          }
          break;
          
        case 'ellipse':
          if (window.GEllipse) {
            shape = new window.GEllipse();
          }
          break;
          
        case 'path':
          if (window.GPath) {
            shape = new window.GPath();
          }
          break;
          
        default:
          console.error('Unknown shape type:', type);
          return null;
      }
      
      if (shape) {
        console.log(`✅ Created ${type}:`, shape);
        return shape;
      }
      
      console.error('Could not create shape - class not found');
      return null;
    },
    
    /**
     * Export scene to JSON for inspection
     */
    exportSceneJSON() {
      const scene = this.getScene();
      if (!scene) {
        console.error('No scene available');
        return null;
      }
      
      function nodeToJSON(node, depth = 0) {
        if (!node || depth > 10) return null;
        
        const obj = {
          type: node.constructor?.name || typeof node,
          properties: {}
        };
        
        // Get basic properties
        for (const key of Object.keys(node)) {
          const val = node[key];
          if (typeof val !== 'function' && typeof val !== 'object') {
            obj.properties[key] = val;
          }
        }
        
        // Get children
        if (typeof node.getFirstChild === 'function') {
          obj.children = [];
          let child = node.getFirstChild();
          while (child) {
            const childJSON = nodeToJSON(child, depth + 1);
            if (childJSON) obj.children.push(childJSON);
            child = typeof child.getNext === 'function' ? child.getNext() : null;
          }
        }
        
        return obj;
      }
      
      const json = nodeToJSON(scene);
      console.log('Scene JSON:', json);
      return json;
    },
    
    /**
     * Show help
     */
    help() {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    GravitDebug v${this.version}                      ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  🔍 DISCOVERY                                                 ║
║  ─────────────────────────────────────────────────────────── ║
║  GravitDebug.getApp()        - Get the main application      ║
║  GravitDebug.getScene()      - Get the current scene         ║
║  GravitDebug.getEditor()     - Get the editor instance       ║
║  GravitDebug.listGClasses()  - List all G* classes           ║
║                                                               ║
║  🔬 INSPECTION                                                ║
║  ─────────────────────────────────────────────────────────── ║
║  GravitDebug.inspectClass('GPath')  - Inspect a class        ║
║  GravitDebug.findElements('Path')   - Find elements by type  ║
║  GravitDebug.getBBox(element)       - Get bounding box       ║
║  GravitDebug.exportSceneJSON()      - Export scene as JSON   ║
║                                                               ║
║  🛠️ DEBUGGING                                                 ║
║  ─────────────────────────────────────────────────────────── ║
║  GravitDebug.trace(obj, 'method')   - Trace method calls     ║
║  GravitDebug.hookPrototype('Class', 'method', callback)      ║
║                                                               ║
║  🎨 CREATION                                                  ║
║  ─────────────────────────────────────────────────────────── ║
║  GravitDebug.createTestShape('rectangle', {x:100, y:100})    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    }
  };
  
  // Expose globally
  window.GravitDebug = GravitDebug;
  
  console.log('🔧 GravitDebug loaded. Type GravitDebug.help() for usage.');
})();
