# graph-3d

Babylon.js application that represents a node based 3D directed graph.

## Overview

This is a 3D visualization of a directed graph using Babylon.js. Nodes are represented as colored spheres with different sizes, and edges are shown as directed arrows.

## Features

- 3D spherical nodes with customizable colors based on type
- Directed arrows showing relationships between nodes
- Interactive camera controls (rotate, zoom, pan)
- JSON-based data import for nodes and edges
- **Configurable data sources** with multiple preset configurations
- Automatic circular layout algorithm for node positioning
- Support for rich node and edge metadata

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Then open your browser to `http://localhost:5173`

#### Using Different Data Configurations

By default, the application loads data from `nodes.json` and `edges.json`. You can switch between different data configurations using the `config` query parameter:

- **Default configuration**: `http://localhost:5173` (loads `nodes.json` and `edges.json`)
- **Example configuration**: `http://localhost:5173?config=example` (loads `nodes.example.json` and `edges.example.json`)

You can add more configurations by editing the `configs` object in `src/main.js`.

### Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Current Implementation

### Configurable Data Loading

The application supports multiple data configurations that can be selected via URL query parameters. Each configuration specifies which JSON files to load for nodes and edges.

**Available Configurations:**

- `default` - Loads `nodes.json` and `edges.json` (used when no config parameter is specified)
- `example` - Loads `nodes.example.json` and `edges.example.json`

**Usage:**
```
http://localhost:5173                    # Uses default config
http://localhost:5173?config=example     # Uses example config
http://localhost:5173?config=invalid     # Falls back to default config
```

**Adding New Configurations:**

Edit the `configs` object in `src/main.js`:
```javascript
const configs = {
    default: {
        nodes: '../nodes.json',
        edges: '../edges.json'
    },
    myconfig: {
        nodes: '../my-nodes.json',
        edges: '../my-edges.json'
    }
};
```

Then access it via `http://localhost:5173?config=myconfig`

### Data Formats

The project loads graph data from JSON files:

### Node Format (`nodes.json`)
```json
[
  {
    "id": "node1",
    "name": "Node Name",
    "type": "primary",
    "tags": ["tag1", "tag2"]
  }
]
```

Supported node types and their colors:
- `primary` - Red
- `secondary` - Green  
- `tertiary` - Blue
- `default` - Yellow

### Edge Format (`edges.json`)
```json
[
  {
    "source": "node1",
    "target": "node2",
    "weight": 1172,
    "type": "connection-type",
    "dayOfMonth": 1,
    "tags": ["tag"],
    "notes": "Description"
  }
]
```

The application automatically positions nodes in a circular layout and renders them as colored 3D spheres with directed arrows representing edges.

## Future Enhancements

This is a foundation that can be extended with:
- Advanced graph layout algorithms (force-directed, hierarchical, etc.)
- Node labels and interactive tooltips
- Interactive node selection and highlighting
- Custom styling options per node/edge
- Animation effects and transitions
- Graph filtering and search capabilities
- Export functionality
