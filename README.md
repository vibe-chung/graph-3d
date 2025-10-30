# graph-3d

Babylon.js application that represents a node based 3D directed graph.

## Overview

This is a 3D visualization of a directed graph using Babylon.js. Nodes are represented as colored spheres with different sizes, and edges are shown as directed arrows.

## Features

- 3D spherical nodes with customizable colors and sizes
- Directed arrows showing relationships between nodes
- Interactive camera controls (rotate, zoom, pan)
- Sample 3-node network demonstrating the concept

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

The skeleton project includes:
- 3 nodes with different colors (red, green, blue) and sizes
- Directed edges forming a cycle: Node 1 → Node 2 → Node 3 → Node 1
- Interactive 3D camera
- Basic lighting setup

## Future Enhancements

This is a foundation that can be extended with:
- Dynamic graph loading from data sources
- Node labels and metadata
- Interactive node selection
- Custom styling options
- Graph layout algorithms
- Animation effects
