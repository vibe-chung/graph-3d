# graph-3d

Babylon.js application that represents a node based 3D directed graph.

## Overview

This is a 3D visualization of a directed graph using Babylon.js. Nodes are represented as colored spheres with different sizes, and edges are shown as directed arrows.

## Features

- 3D spherical nodes with customizable colors based on type
- Directed arrows showing relationships between nodes
- Interactive camera controls (rotate, zoom, pan)
- JSON-based data import for nodes and edges
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
