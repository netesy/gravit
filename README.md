# Gravit Designer — Self-Hosted Edition

<p align="center">
  <img src="public/assets/img/brand/gravit-designer.svg" alt="Gravit Designer Logo" width="200" />
</p>

<p align="center">
  A locally hosted version of <strong>Gravit Designer</strong> (Corel Vector) with a reverse-engineered module system, offline capability, and full Pro features — no cloud account required.
</p>

---

## Screenshots

<table>
  <tr>
    <td align="center"><strong>Welcome Screen</strong></td>
    <td align="center"><strong>New Document</strong></td>
  </tr>
  <tr>
    <td><img src="public/assets/help/Screenshot.png" alt="Welcome Screen" width="420" /></td>
    <td><img src="docs/images/new-design-custom.png" alt="New Document" width="420" /></td>
  </tr>
  <tr>
    <td align="center"><strong>Canvas &amp; Tools</strong></td>
    <td align="center"><strong>Template Gallery</strong></td>
  </tr>
  <tr>
    <td><img src="docs/images/designer-trunk.gravit.io_.png" alt="Designer Canvas" width="420" /></td>
    <td><img src="docs/images/templates1.png" alt="Templates" width="420" /></td>
  </tr>
</table>

## Features

- **Fully offline** — runs on `localhost` with zero external dependencies at runtime
- **Pro license unlocked** — all premium features available out of the box
- **Express server** with static file serving, WebSocket support, and API stubs
- **Multi-language support** — 15 locales including EN, DE, FR, ES, JA, ZH, and more
- **Built-in documentation** — complete HTML user guide served at `/docs`
- **Reverse-engineering toolkit** — tools to extract, analyze, and reconstruct the minified source

## Quick Start

### Prerequisites

- **Node.js** ≥ 18.0.0
- **npm**

### Installation

```bash
git clone <repo-url> gravit-designer
cd gravit-designer
npm install
```

### Running

```bash
# Production
npm start

# Development (auto-restart on changes)
npm run dev
```

Open **http://localhost:3100** in your browser.

## Project Structure

```
gravit-designer/
├── server.js                  # Express + WebSocket server
├── package.json
├── manifest.json              # PWA manifest
│
├── public/                    # Client-side application
│   ├── index.html             # Entry point
│   ├── designer.browser.js    # Main app bundle (~6.7 MB)
│   ├── designer.browser.dev.js # Dev build (generated)
│   ├── chunk.vendor.js        # Core engine (~11.7 MB)
│   ├── assets/
│   │   ├── font/              # Bundled fonts
│   │   ├── icon/              # UI icons
│   │   ├── img/               # Images & branding
│   │   └── prerendered/       # App icons (16–512 px)
│   └── *.worker.js            # Web Workers (PDF, PS, autosave)
│
├── routes/
│   ├── user.js                # User profile & settings API
│   └── ws.js                  # WebSocket (license heartbeat)
│
├── docs/                      # Full HTML user guide (~90 pages)
│   └── images/                # Guide screenshots & illustrations
│
├── scripts/
│   └── generate-icons.cjs     # SVG icon generator
│
└── reverse-engineering/       # Source analysis toolkit
    ├── build-bundle.cjs       # Rebuilds dev bundle
    ├── extract-all-modules.cjs
    ├── analyze-refs.cjs
    ├── rename-variables.cjs
    ├── extracted-modules/     # Webpack module maps
    ├── reconstructed/         # Reconstructed source files
    ├── analysis/              # Class & reference reports
    └── README.md              # Toolkit documentation
```

## NPM Scripts

| Script          | Description                                            |
| --------------- | ------------------------------------------------------ |
| `npm start`     | Start the server on port 3100                          |
| `npm run dev`   | Start with `--watch` for auto-reload                   |
| `npm run build` | Rebuild the dev bundle from reverse-engineered modules |
| `npm run icons` | Generate SVG icon set                                  |
| `npm run serve` | Build + start in one command                           |
| `npm run clean` | Remove the generated dev bundle                        |

## Server API

The Express server exposes lightweight stubs so the client runs entirely offline:

| Endpoint                              | Method | Purpose                                     |
| ------------------------------------- | ------ | ------------------------------------------- |
| `/connection/test`                    | GET    | Connectivity check → `"OK"`                 |
| `/maintenance/status`                 | GET    | Maintenance flag → `{ maintenance: false }` |
| `/license`                            | GET    | License info → Pro plan, no expiry          |
| `/subscription/test`                  | GET    | Subscription status → active Pro            |
| `/user/profile`                       | GET    | Local user profile                          |
| `/file`                               | GET    | File listing (empty)                        |
| `/i18n-url/:locale/designer`          | GET    | i18n resource URL                           |
| `ws://localhost:3100/license/license` | WS     | License heartbeat (ping/pong)               |

## Documentation

The bundled user guide is served at **http://localhost:3100/docs** and covers:

<table>
  <tr>
    <td>

- Getting Started & Quickstart
- Drawing & Shape Tools
- Vector Anatomy & Paths
- Colors, Gradients & Textures
- Fills, Borders & Effects
- Text Properties & Text on Path

</td>
    <td>

- Layers, Groups & Symbols
- Alignment, Distribution & Grids
- Import, Export & File Formats
- Blending Modes & Clipping Masks
- Keyboard Shortcuts
- Touch Interface Guide

</td>
  </tr>
</table>

<p align="center">
  <img src="docs/images/02_Structure.png" alt="Interface Overview" width="600" />
</p>

## Reverse Engineering

The `reverse-engineering/` directory contains a full toolkit for analyzing and modifying the Gravit Designer source code. Key discoveries:

- **All class names preserved** — `GObject`, `GScene`, `GEditor`, `GPaintCanvas`, etc.
- **All method names preserved** — `getBBox`, `transform`, `paint`, `hitTest`, etc.
- **Inheritance tree intact** — via `GObject.inherit()` pattern

```bash
cd reverse-engineering
npm install
node build-bundle.cjs        # Rebuild the dev bundle
node extract-all-modules.cjs # Extract webpack module map
node analyze-refs.cjs         # Cross-reference analysis
node rename-variables.cjs     # Improve minified variable names
```

See [reverse-engineering/README.md](reverse-engineering/README.md) for the full toolkit documentation.

## Tech Stack

| Component | Technology                        |
| --------- | --------------------------------- |
| Server    | Node.js + Express 5               |
| WebSocket | ws 8.x                            |
| Client    | Gravit Designer (Webpack bundle)  |
| Workers   | PDF export, PostScript, Autosave  |
| Styles    | Light & Dark themes (CSS)         |
| PWA       | Web App Manifest + Service Worker |

## Theming

Gravit Designer ships with two themes out of the box:

| Theme | Stylesheet                   |
| ----- | ---------------------------- |
| Light | `designer.browser.light.css` |
| Dark  | `designer.browser.dark.css`  |

<table>
  <tr>
    <td align="center"><strong>Light Theme</strong></td>
    <td align="center"><strong>Dark Theme</strong></td>
  </tr>
  <tr>
    <td><img src="docs/images/06_LightTheme.png" alt="Light Theme" width="420" /></td>
    <td><img src="docs/images/05_Dark-Theme.png" alt="Dark Theme" width="420" /></td>
  </tr>
</table>

## Configuration

| Variable | Default | Description                                |
| -------- | ------- | ------------------------------------------ |
| `PORT`   | `3100`  | Server port (set via environment variable) |

```bash
# Run on a custom port
PORT=8080 npm start
```

## License

This project is intended for **educational and personal use only**. Gravit Designer / Corel Vector is proprietary software owned by Alludo (formerly Corel Corporation). All rights to the original application remain with their respective owners.
