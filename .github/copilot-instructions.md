# GitHub Copilot Instructions for graph-3d

## Repository Overview

This is a 3D graph visualization application built with Babylon.js. The project displays a directed graph with nodes represented as colored 3D spheres and edges shown as directed arrows. The application uses a simple circular layout algorithm to position nodes in 3D space.

## Project Structure

```
graph-3d/
├── src/
│   └── main.js          # Main application entry point with Babylon.js scene setup
├── nodes.json           # Node data (id, name, type, tags)
├── edges.json           # Edge data (source, target, weight, type, etc.)
├── index.html           # HTML entry point with canvas element
├── package.json         # NPM dependencies and scripts
├── vite.config.js       # Vite build configuration
└── README.md            # Project documentation
```

## Technologies Used

- **Babylon.js** (v7.0.0): 3D rendering engine
- **Vite** (v5.0.0): Build tool and dev server
- **JavaScript (ES Modules)**: Modern JavaScript with module imports
- **JSON**: Data format for nodes and edges

## Development Workflow

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup and Build Commands

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Development server** (hot reload enabled):
   ```bash
   npm run dev
   ```
   - Opens at `http://localhost:5173`
   - Vite provides fast HMR (Hot Module Replacement)

3. **Production build**:
   ```bash
   npm run build
   ```
   - Outputs to `dist/` directory
   - Creates optimized bundles

4. **Preview production build**:
   ```bash
   npm run preview
   ```

### Testing
- Currently, there is no test suite in this repository
- Manual testing is done via the development server

### Linting
- No linter is currently configured
- Follow JavaScript ES6+ standards and conventions

## Code Style and Conventions

### General Guidelines
- Use ES6+ features (const/let, arrow functions, template literals, etc.)
- Use meaningful variable and function names
- Keep functions focused and single-purpose
- Add comments only for complex logic or algorithms

### Babylon.js Conventions
- Create meshes using `MeshBuilder` factory methods
- Store mesh references in descriptive variables or objects
- Use `Vector3` for 3D positions and directions
- Create materials with `StandardMaterial` or similar classes
- Name scene objects descriptively (e.g., `node-${id}`, `material-${id}`)

### Module Structure
- Keep all imports at the top of the file
- Group imports by source (external libraries, then local files)
- Export only what's necessary

### Data Format Conventions

**Nodes** (`nodes.json`):
```json
{
  "id": "unique-id",
  "name": "Display Name",
  "type": "primary|secondary|tertiary|default",
  "tags": ["tag1", "tag2"]
}
```

**Edges** (`edges.json`):
```json
{
  "source": "node-id-from",
  "target": "node-id-to",
  "weight": 1000,
  "type": "connection-type",
  "dayOfMonth": 1,
  "tags": ["tag"],
  "notes": "Description"
}
```

## Key Implementation Details

### Color Scheme
- **primary**: Red (`Color3(1, 0.3, 0.3)`)
- **secondary**: Green (`Color3(0.3, 1, 0.3)`)
- **tertiary**: Blue (`Color3(0.3, 0.3, 1)`)
- **default**: Yellow (`Color3(0.8, 0.8, 0.3)`)

### Layout Algorithm
- Nodes are positioned in a circular layout
- Default radius: 8 units from center
- Evenly distributed around the circle
- All nodes at y=0 (same horizontal plane)

### Arrow Rendering
- Arrows consist of a cylinder (shaft) and cone (head)
- Arrows are positioned between node surfaces (not centers)
- Direction calculated using vector math
- Arrow rotation uses quaternions and cross products

## Common Tasks

### Adding a New Node Type
1. Add color to `getColorForType()` in `src/main.js`
2. Update README.md documentation

### Changing Layout Algorithm
- Modify `calculateCircularLayout()` function in `src/main.js`
- Consider: force-directed, hierarchical, random, or grid layouts

### Modifying Arrow Appearance
- Adjust arrow dimensions in `createArrow()` function
- Change shaft diameter, length ratio, or cone size
- Modify arrow material for different colors or effects

### Adding Node Labels
- Use `GUI.AdvancedDynamicTexture` from `@babylonjs/gui`
- Add dependency: `npm install @babylonjs/gui`
- Create text blocks attached to node positions

## Future Enhancement Ideas

- Interactive node selection and highlighting
- Advanced layout algorithms (force-directed, hierarchical)
- Node labels and tooltips on hover
- Animation effects and transitions
- Graph filtering and search capabilities
- Custom styling per node/edge
- Export functionality (PNG, SVG, JSON)

## Important Notes for Copilot

- This is a visualization-focused project; performance matters for rendering
- Babylon.js uses a right-handed coordinate system
- The scene renders continuously via `engine.runRenderLoop()`
- Camera controls are built-in with `ArcRotateCamera`
- Always test 3D changes visually in the browser
- JSON data files are imported statically; changes require rebuild
- Keep bundle size in mind; Babylon.js is already large (~5MB)
