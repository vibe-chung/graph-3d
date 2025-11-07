import { getConfig, loadJSON } from './config.js';
import { createScene } from './sceneSetup.js';
import { calculateHierarchicalLayout } from './layoutAlgorithm.js';
import { createNodes, createEdges } from './graphRenderer.js';
import { setupInteractions } from './graphInteractions.js';

// Get canvas element
const canvas = document.getElementById('renderCanvas');

// Create scene, engine and camera
const { engine, scene } = createScene(canvas);

// Main initialization function
async function initializeGraph() {
    // Load configuration
    const config = getConfig();
    
    // Load data from configured sources
    const nodesData = await loadJSON(config.nodes);
    const edgesData = await loadJSON(config.edges);
    
    // Convert edges from JSON format first (needed for layout calculation)
    const edges = edgesData.map(edge => ({
        from: edge.source,
        to: edge.target,
        weight: edge.weight || 0,
        type: edge.type || 'default',
        dayOfMonth: edge.dayOfMonth || null,
        tags: edge.tags || [],
        notes: edge.notes || ''
    }));

    // Filter out disconnected nodes (nodes with no edges)
    const connectedNodeIds = new Set();
    edges.forEach(edge => {
        connectedNodeIds.add(edge.from);
        connectedNodeIds.add(edge.to);
    });
    const connectedNodes = nodesData.filter(node => connectedNodeIds.has(node.id));

    // Convert JSON data to internal format with 3D hierarchical layout
    const nodes = calculateHierarchicalLayout(connectedNodes, edges);

    // Create nodes as spheres
    const { nodeMeshes, nodeLabels } = createNodes(nodes, scene);

    // Create edges as directed arrows
    const edgeMeshes = createEdges(nodes, edges, scene);

    // Setup GUI and interactions
    return setupInteractions(scene, nodeLabels, nodeMeshes, edgeMeshes, edges);
}

// Store reference to graph instance for cleanup
let graphInstance = null;

// Initialize and start the graph
initializeGraph().then(instance => {
    graphInstance = instance;
}).catch(error => {
    console.error('Failed to initialize graph:', error);
    // Display error message to user using DOM
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(255, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 5px;
        font-family: Arial, sans-serif;
        z-index: 1000;
    `;
    errorDiv.textContent = `Error loading graph: ${error.message}`;
    document.body.appendChild(errorDiv);
});

// Run the render loop
engine.runRenderLoop(() => {
    scene.render();
});

// Handle window resize
const handleResize = () => {
    engine.resize();
};
window.addEventListener('resize', handleResize);

// Cleanup on window unload
window.addEventListener('beforeunload', () => {
    window.removeEventListener('resize', handleResize);
    if (graphInstance) {
        graphInstance.dispose();
    }
    scene.dispose();
    engine.dispose();
});
