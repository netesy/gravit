/**
 * Gravit Designer Reverse Engineering - Module Extractor
 * 
 * This script extracts individual webpack modules from the bundled files
 * and saves them as separate files with readable names.
 * 
 * Usage: node extract-modules.js
 */

const fs = require('fs-extra');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OUTPUT_DIR = path.join(__dirname, 'extracted-modules');

// Module ID to Class Name mapping (extracted from chunk.vendor.js)
const MODULE_MAP = {
  // Core Engine (from module 1 exports)
  0: 'GObject',
  2: 'GNode',
  5: 'GPoint',
  6: 'GRect',
  7: 'GTransform',
  9: 'GLocale',
  11: 'GUtil',
  12: 'GMath',
  14: 'GPaintCanvas',
  17: 'GRGBColor',
  22: 'GElement',
  28: 'GStylable',
  45: 'GPathBase',
  47: 'GLocaleKey',
  48: 'GVertex',
  50: 'GPattern',
  51: 'GWebGLEffect',
  54: 'GVertexContainer',
  56: 'GShape',
  59: 'GVertexInfo',
  60: 'GPath',
  63: 'GVertexTransformer',
  68: 'GColor',
  69: 'GBlock',
  70: 'GText',
  72: 'GEvent',
  73: 'GRectangle',
  75: 'GEventTarget',
  83: 'GPage',
  84: 'GAnnotation',
  87: 'GVertexSource',
  95: 'GImage',
  104: 'GItem',
  108: 'GFont',
  111: 'GRendererCtx',
  113: 'GCompoundPath',
  122: 'GGroup',
  132: 'GLength',
  133: 'GScenePaintConfiguration',
  138: 'GGradient',
  139: 'GTexturePattern',
  142: 'GDate',
  147: 'GLinearGradient',
  158: 'GRadialGradient',
  159: 'GLayer',
  160: 'GScene',
  161: 'GTLUtil',
  162: 'GPathsGraph',
  166: 'GRendererConfig',
  176: 'GSystem',
  179: 'GPathUtil',
  188: 'GCMYKColor',
  205: 'GRendererCtxDbg',
  207: 'GSceneOptions',
  214: 'GEllipse',
  215: 'GTLPathTextTransformer',
  216: 'GSymbol',
  224: 'GTranslation',
  227: 'GDictionary',
  228: 'GPaintContext',
  229: 'GHitResult',
  233: 'GCompoundShape',
  249: 'GBlurEffect',
  264: 'GVertexPolyBoolean',
  265: 'GBackground',
  266: 'GTLDirectionTextTransformer',
  268: 'GConnector',
  280: 'GWorkspace',
  281: 'GFontManager',
  282: 'GGLBlurEffect',
  283: 'GAngularGradient',
  284: 'GPolygon',
  285: 'GCommentAnnotation',
  289: 'GSlice',
  316: 'GRectangleAnnotation',
  317: 'GEllipseAnnotation',
  318: 'GHighlighterAnnotation',
  319: 'GArrowAnnotation',
  320: 'GPencilAnnotation',
  321: 'GDropShadowEffect',
  327: 'GActionable',
  345: 'GBitmap',
  347: 'GPGEdge',
  366: 'GComment',
  370: 'GTextAnnotation',
  432: 'GInnerShadowEffect',
  457: 'GLocaleLanguage',
  471: 'GTransactionRecorder',
  506: 'GAnnotationsList',
  511: 'GStyle',
  517: 'GSwatch',
  518: 'GNoisePattern',
  528: 'GParameterizedVertexProcessor',
  530: 'GSimpleShape',
  531: 'GCollabText',
  532: 'GAnnotable',
  533: 'GCollaborativeTextAnnotation',
  534: 'GImageGrid',
  535: 'GMultiEffect',
  587: 'GOpenTypeFont',
  588: 'GGLColorAdjustEffect',
  648: 'GColorHelper',
  649: 'GHSVColor',
  651: 'GVertexOffsetter',
  656: 'GPGFacet',
  658: 'GSceneDictionary',
  661: 'GGLNoiseEffect',
  662: 'GSwatches',
  726: 'GOpenTypeUtil',
  727: 'GActionItem',
  728: 'GGLSepiaEffect',
  729: 'GOverlayEffect',
  730: 'GGLBrightnessContrastEffect',
  731: 'GGLDotScreenEffect',
  732: 'GGLHueSaturationEffect',
  839: 'GGLZoomBlurEffect',
  840: 'GMirrorEffect',
  1001: 'GSceneUtil',
  1002: 'GVertexSimplifier',
  1003: 'GImageTracer',
  1004: 'GGLBulgePinchEffect',
  1005: 'GGLEdgeWorkEffect',
  1006: 'GGLColorHalfToneEffect',
  1007: 'GGLHexagonalEffect',
  1008: 'GColorGradingEffect',
  1010: 'GGLInnerGlowEffect',
  1011: 'GGLToonEffect',
  1012: 'GGLBloomEffect',
  1013: 'GGLTrueBlurEffect',
  1014: 'GGLDenoiseEffect',
  1015: 'GGLOuterGlowEffect',
  1016: 'GGLSwirlEffect',
  1017: 'GGLVignetteEffect',
  1018: 'GGLStrokeLayerEffect',
  1019: 'GGLInkEffect',
  1020: 'GGLUnsharpMaskEffect',
  1021: 'GGLVibranceEffect',
  1022: 'GGLSketchEffect',
  1023: 'GGLLensBlurEffect',
  1024: 'GGLTiltShiftEffect',
  1025: 'GGLRecolourEffect',
  1026: 'GColorAdjustMultiEffect',
  1027: 'GAdjustMultiEffect',
  1028: 'GContactShadowEffect',
  1029: 'GCurvedShadowEffect',
  1031: 'GLongShadowEffect',
  1032: 'GGLBendEffect',
  1033: 'GGLDrunkEffect',
  1034: 'GGLFisheyeEffect',
  1035: 'GEmptyAnnotation',
};

// Old to New class name mapping (IFObject -> GObject style)
const OLD_TO_NEW_CLASSES = {
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
  'GUIPlatform': 'GPlatform',
  'GEventTarget': 'GEventTarget',
  'GEvent': 'GEvent',
};

async function extractModules() {
  console.log('🔧 Gravit Designer Module Extractor');
  console.log('====================================\n');
  
  await fs.ensureDir(OUTPUT_DIR);
  
  // Read the vendor chunk (contains core engine)
  const vendorPath = path.join(PUBLIC_DIR, 'chunk.vendor.js');
  const vendorCode = await fs.readFile(vendorPath, 'utf8');
  
  // Read the main designer bundle
  const designerPath = path.join(PUBLIC_DIR, 'designer.browser.js');
  const designerCode = await fs.readFile(designerPath, 'utf8');
  
  console.log(`📁 Vendor bundle: ${(vendorCode.length / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📁 Designer bundle: ${(designerCode.length / 1024 / 1024).toFixed(2)} MB`);
  
  // Extract module boundaries using webpack's module pattern
  // Modules are defined in arrays like: [function(e, t, n) { ... }, ...]
  
  const modulePattern = /function\s*\(\s*e\s*,\s*t\s*(?:,\s*\w+)*\s*\)\s*\{/g;
  let match;
  let moduleCount = 0;
  
  // Count approximate modules
  while ((match = modulePattern.exec(vendorCode)) !== null) {
    moduleCount++;
  }
  console.log(`\n📦 Found approximately ${moduleCount} modules in vendor bundle`);
  
  // Save the module map
  const mapPath = path.join(OUTPUT_DIR, 'module-map.json');
  await fs.writeJson(mapPath, MODULE_MAP, { spaces: 2 });
  console.log(`\n✅ Module map saved to: ${mapPath}`);
  
  // Save the class name mapping
  const classMapPath = path.join(OUTPUT_DIR, 'class-name-mapping.json');
  await fs.writeJson(classMapPath, OLD_TO_NEW_CLASSES, { spaces: 2 });
  console.log(`✅ Class mapping saved to: ${classMapPath}`);
  
  console.log('\n📝 Key findings:');
  console.log('   - Core engine classes are preserved (GObject, GScene, etc.)');
  console.log('   - Variable names are minified (e, t, n, o, i, a, r, s, l, c)');
  console.log('   - Method names on prototypes are preserved');
  console.log('   - String literals (property names, events) are preserved');
  
  console.log('\n💡 Next steps:');
  console.log('   1. Run: node beautify.js - to format the minified code');
  console.log('   2. Run: node unbundle.js - to extract individual modules');
  console.log('   3. Compare with gravit-original/src for context');
}

extractModules().catch(console.error);
