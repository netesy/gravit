# Gravit Designer - Reverse Engineering Comparison Report

Generated: 2026-02-14T20:00:00.048Z

## Overview

This report compares the old open-source Gravit (circa 2013-2014) with the current
minified version. The goal is to help understand the code structure and assist
with reverse engineering efforts.

## Key Changes

### Naming Convention
- Old: `IF*` prefix for Infinity classes (e.g., `IFObject`, `IFScene`)
- New: `G*` prefix (e.g., `GObject`, `GScene`)

### Build System
- Old: Grunt + Bower + concatenation
- New: Webpack + NPM + bundling/minification

### Code Structure
- Old: Global namespace with `_` (underscore) wrapper
- New: CommonJS modules with webpack runtime

## Class Mapping

| Old Class | New Class | Module ID | Original File |
|-----------|-----------|-----------|---------------|
| IFObject | GObject | N/A | infinity/core/object.js |
| IFNode | GNode | 2 | infinity/scene/node.js |
| IFMath | GMath | 12 | infinity/core/math.js |
| IFUtil | GUtil | 11 | infinity/core/util.js |
| IFLocale | GLocale | 9 | infinity/i18n/locale.js |
| IFPoint | GPoint | 5 | infinity/geometry/point.js |
| IFRect | GRect | 6 | infinity/geometry/rect.js |
| IFTransform | GTransform | 7 | infinity/geometry/transform.js |
| IFVertex | GVertex | 48 | infinity/vertex/vertex.js |
| IFVertexSource | GVertexSource | 87 | infinity/vertex/vertexsource.js |
| IFVertexContainer | GVertexContainer | 54 | infinity/vertex/vertexcontainer.js |
| IFVertexTransformer | GVertexTransformer | 63 | infinity/vertex/vertextransformer.js |
| IFScene | GScene | 160 | infinity/scene/scene.js |
| IFElement | GElement | 22 | infinity/scene/element.js |
| IFBlock | GBlock | 69 | infinity/scene/block.js |
| IFItem | GItem | 104 | infinity/scene/item.js |
| IFShape | GShape | 56 | infinity/scene/shape/shape.js |
| IFPath | GPath | 60 | infinity/scene/shape/path.js |
| IFRectangle | GRectangle | 73 | infinity/scene/shape/rectangle.js |
| IFEllipse | GEllipse | 214 | infinity/scene/shape/ellipse.js |
| IFPolygon | GPolygon | 284 | infinity/scene/shape/polygon.js |
| IFText | GText | 70 | infinity/scene/shape/text.js |
| IFImage | GImage | 95 | infinity/scene/shape/image.js |
| IFLayer | GLayer | 159 | infinity/scene/structure/layer.js |
| IFPage | GPage | 83 | infinity/scene/structure/page.js |
| IFGroup | GGroup | 122 | infinity/scene/shape/group.js |
| IFStylable | GStylable | 28 | infinity/scene/style/stylable.js |
| IFStyle | GStyle | 511 | infinity/scene/style/style.js |
| IFPattern | GPattern | 50 | infinity/paint/pattern.js |
| IFGradient | GGradient | 138 | infinity/paint/gradient.js |
| IFColor | GColor | 68 | infinity/paint/color.js |
| IFPaintCanvas | GPaintCanvas | 14 | infinity/paint/paintcanvas.js |
| IFPaintContext | GPaintContext | 228 | infinity/paint/paintcontext.js |
| GEvent | GEvent | 72 | infinity/event/event.js |
| GEventTarget | GEventTarget | 75 | infinity/event/eventtarget.js |
| GUIPlatform | GPlatform | N/A | infinity/platform.js |


## Old Classes Found

### GApplication
- File: `application\application.js`
- Methods: _initialized, _toolManager, _documentUntitledCount, _documents, _activeDocument, _view, _header, _toolbar, _panels, _sidebars...

### GMenu
- File: `application\component\menu.js`
- Methods: _parent, _htmlElement, _items, _hovered, getParent, isHovered, isRootMenu, isSubMenu, createAddDivider, createInsertDivider...

### GMenuBar
- File: `application\component\menubar.js`
- Methods: _menu, getMenu, isActive, toString

### GMenuItem
- File: `application\component\menuitem.js`
- Methods: _parent, _type, _menu, _icon, _caption, _shortcutHint, _action, getParent, getType, getIcon...

### GDocument
- File: `application\document.js`
- Methods: _scene, _url, _editor, _windows, _activeWindow, _title, getScene, getStorage, getUrl, setUrl...

### GAction
- File: `application\extension\action.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, isCheckable, isChecked, isAvailable, execute...

### GColorMatcher
- File: `application\extension\colormatcher.js`
- Methods: getTitle, getCategory, match, toString

### GExporter
- File: `application\extension\exporter.js`
- Methods: isStandalone, getName, getExtensions, exportPart

### GModule
- File: `application\extension\module.js`
- Methods: init

### GPalette
- File: `application\extension\palette.js`
- Methods: getGroup, isEnabled, init, toString

### GPanel
- File: `application\extension\panel.js`
- Methods: getTitle, init, activate, deactivate, toString

### GProperties
- File: `application\extension\properties.js`
- Methods: getCategory, init, update, toString

### GSidebar
- File: `application\extension\sidebar.js`
- Methods: getIcon, init, activate, deactivate, toString

### GStorage
- File: `application\extension\storage.js`
- Methods: isAvailable, isSaving, isPrompting, isDirectory, getProtocol, getExtensions, getName, openResourcePrompt, saveResourcePrompt, openDirectoryPrompt...

### GStyleEntry
- File: `application\extension\styleentry.js`
- Methods: getEntryClass, getEntryName, createContent, updateProperties, assignProperties, toString

### GTransformer
- File: `application\extension\transformer.js`
- Methods: getCategory, init, update, toString

### GView
- File: `application\extension\view.js`
- Methods: _documentStates, getId, getTitle, _createDocumentState, _activateDocumentState, _deactivateDocumentState, _documentEvent, _findDocumentState, toString

### GShell
- File: `application\shell.js`
- Methods: isDevelopment, prepare, start, addMenu, addMenuSeparator, addMenuItem, updateMenuItem, removeMenuItem, getClipboardMimeTypes, getClipboardContent...

### GHeader
- File: `application\workspace\header.js`
- Methods: _htmlElement, init, relayout

### GPalettes
- File: `application\workspace\palettes.js`
- Methods: _htmlElement, _palettesInfo, _groupsInfo, groupPalettes, isPaletteActive, setPaletteActive, isPaletteEnabled, setPaletteEnabled, init, relayout...

### GPanels
- File: `application\workspace\panels.js`
- Methods: _htmlElement, _panels, _activePanel, getActivePanel, setActivePanel, init, relayout

### GSidebars
- File: `application\workspace\sidebars.js`
- Methods: _htmlElement, _sidebars, _activeSidebar, getActiveSidebar, setActiveSidebar, init, relayout

### GToolbar
- File: `application\workspace\toolbar.js`
- Methods: _htmlElement, _groupedTools, init, relayout, _toolChanged, _windowEvent, _updateZoomFromWindow, _updateGroupTool, _getToolTitle, _getToolInfo

### GWindow
- File: `application\workspace\window.js`
- Methods: _container, _document, _view, _contextMenuClientPosition, getDocument, getView, getTitle, activate, deactivate, release...

### GWindows
- File: `application\workspace\windows.js`
- Methods: _htmlElement, _windows, _activeWindow, _viewOffset, getWindows, getActiveWindow, activateWindow, addWindow, closeWindow, init...

### GDevelopmentModule
- File: `development\development.js`
- Methods: init, toString

### GAddLayerAction
- File: `gravit\action\addlayeraction.js`
- Methods: getId, getTitle, getCategory, getGroup, isEnabled, execute, toString

### GAddPageAction
- File: `gravit\action\addpageaction.js`
- Methods: getId, getTitle, getCategory, getGroup, isEnabled, execute, toString

### GAlignAction
- File: `gravit\action\alignaction.js`
- Methods: _type, _title, getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GArrangeAction
- File: `gravit\action\arrangeaction.js`
- Methods: _type, _title, getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GCloneAction
- File: `gravit\action\cloneaction.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GCloseAction
- File: `gravit\action\closeaction.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GCloseAllAction
- File: `gravit\action\closeallaction.js`
- Methods: getId, getTitle, getCategory, getGroup, isEnabled, execute, toString

### GCopyAction
- File: `gravit\action\copyaction.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GCopyAttributesAction
- File: `gravit\action\copyattributesaction.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GCutAction
- File: `gravit\action\cutaction.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GDeleteAction
- File: `gravit\action\deleteaction.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GDeleteLayerAction
- File: `gravit\action\deletelayeraction.js`
- Methods: getId, getTitle, getCategory, getGroup, isEnabled, execute, toString

### GDeletePageAction
- File: `gravit\action\deletepageaction.js`
- Methods: getId, getTitle, getCategory, getGroup, isEnabled, execute, toString

### GDistributeAction
- File: `gravit\action\distributeaction.js`
- Methods: _type, _title, getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GDuplicateAction
- File: `gravit\action\duplicateaction.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GFitAllAction
- File: `gravit\action\fitallaction.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GFitCurrentLayerAction
- File: `gravit\action\fitcurrentlayeraction.js`
- Methods: getId, getTitle, getCategory, getGroup, isEnabled, execute, toString

### GFitCurrentPageAction
- File: `gravit\action\fitcurrentpageaction.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GFitSelectionAction
- File: `gravit\action\fitselectionaction.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GGroupAction
- File: `gravit\action\groupaction.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GInvertSelectionAction
- File: `gravit\action\invertselectionaction.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GLayerTypeAction
- File: `gravit\action\layertypeaction.js`
- Methods: _layerType, getId, getTitle, getCategory, getGroup, isCheckable, isChecked, isEnabled, execute, toString

### GMagnificationAction
- File: `gravit\action\magnificationaction.js`
- Methods: _magnification, _shortcut, getId, getTitle, getCategory, getGroup, getShortcut, isEnabled, execute, toString

### GNewAction
- File: `gravit\action\newaction.js`
- Methods: getId, getTitle, getCategory, getGroup, getShortcut, execute, toString


## Tips for Reverse Engineering

1. **String Search**: Method names and property names are preserved in the minified code.
   Search for specific method names like `getBBox`, `transform`, `paint`.

2. **Module Dependencies**: The `n(X)` calls in the minified code reference other modules.
   Use the module map to understand what's being imported.

3. **Prototype Chains**: Look for `GObject.inherit(X, Y)` to understand class hierarchies.

4. **Event Names**: Event class names like `GEditor.ModifiedEvent` are preserved.

5. **Property Names**: Properties starting with `@` or `_` are often instance variables.

## Useful Searches

```
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
```
