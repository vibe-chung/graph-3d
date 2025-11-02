import { 
    Engine, 
    Scene, 
    ArcRotateCamera, 
    HemisphericLight, 
    Vector3, 
    MeshBuilder,
    StandardMaterial,
    Color3,
    Color4
} from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials/grid';
import * as GUI from '@babylonjs/gui';

// Configuration for different data sources
const configs = {
    default: {
        nodes: '../nodes.json',
        edges: '../edges.json'
    },
    example: {
        nodes: '../nodes.example.json',
        edges: '../edges.example.json'
    }
};

// Get configuration from query parameter or use default
function getConfig() {
    const urlParams = new URLSearchParams(window.location.search);
    const configName = urlParams.get('config');
    
    if (configName && configs[configName]) {
        return configs[configName];
    }
    
    return configs.default;
}

// Load JSON data from URL
async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

// Create the Babylon.js engine
const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);

// Create scene
const scene = new Scene(engine);
// Use a gradient background similar to Unity editor (darker at bottom, lighter at top)
scene.clearColor = new Color4(0.15, 0.18, 0.25, 1.0);

// Create camera
const camera = new ArcRotateCamera(
    'camera',
    -Math.PI / 2,
    Math.PI / 3,
    20,
    Vector3.Zero(),
    scene
);
camera.attachControl(canvas, true);

// Create light
const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
light.intensity = 0.8;

// Create ground plane with grid (Unity-like)
const ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, scene);
ground.position.y = -10; // Place below the nodes

// Create and apply grid material
const groundMaterial = new GridMaterial('groundMaterial', scene);
groundMaterial.gridRatio = 1.0; // Grid cell size
groundMaterial.majorUnitFrequency = 5; // Bold lines every 5 units
groundMaterial.minorUnitVisibility = 0.45; // Minor grid line visibility
groundMaterial.mainColor = new Color3(0.2, 0.25, 0.35); // Grid area color (bluish gray)
groundMaterial.lineColor = new Color3(0.4, 0.45, 0.55); // Grid line color (lighter bluish)
groundMaterial.opacity = 0.98;
ground.material = groundMaterial;

// Create sky dome for Unity-like atmosphere
const skybox = MeshBuilder.CreateBox('skyBox', { size: 1000.0 }, scene);
const skyboxMaterial = new StandardMaterial('skyBoxMaterial', scene);
skyboxMaterial.backFaceCulling = false;
skyboxMaterial.disableLighting = true;
skyboxMaterial.emissiveColor = new Color3(0.2, 0.25, 0.35); // Sky color matching scene background
skybox.material = skyboxMaterial;
skybox.infiniteDistance = false;

// Helper function to generate colors based on node type
function getColorForType(type) {
    const colorMap = {
        'primary': new Color3(1, 0.3, 0.3),      // Red
        'secondary': new Color3(0.3, 1, 0.3),    // Green
        'tertiary': new Color3(0.3, 0.3, 1),     // Blue
        'default': new Color3(0.8, 0.8, 0.3)     // Yellow
    };
    return colorMap[type] || colorMap.default;
}

// Helper function to calculate node values based on edge weights
function calculateNodeValues(nodes, edges) {
    const nodeValues = {};
    const incomingWeights = {};
    const outgoingWeights = {};
    
    // Initialize values for all nodes
    nodes.forEach(node => {
        incomingWeights[node.id] = 0;
        outgoingWeights[node.id] = 0;
    });
    
    // Calculate incoming and outgoing weights for each node
    edges.forEach(edge => {
        if (outgoingWeights[edge.from] !== undefined) {
            outgoingWeights[edge.from] += edge.weight;
        }
        if (incomingWeights[edge.to] !== undefined) {
            incomingWeights[edge.to] += edge.weight;
        }
    });
    
    // Calculate node values based on role (source/sink/intermediate)
    nodes.forEach(node => {
        const incoming = incomingWeights[node.id];
        const outgoing = outgoingWeights[node.id];
        
        if (outgoing > 0 && incoming === 0) {
            // Source node: only has outgoing edges
            nodeValues[node.id] = outgoing;
        } else if (incoming > 0 && outgoing === 0) {
            // Sink node: only has incoming edges
            nodeValues[node.id] = incoming;
        } else if (incoming > 0 && outgoing > 0) {
            // Intermediate node: has both incoming and outgoing edges
            nodeValues[node.id] = incoming - outgoing;
        } else {
            // No edges (disconnected node)
            nodeValues[node.id] = 0;
        }
    });
    
    return nodeValues;
}

// Helper function to calculate radius based on node value using logarithmic scale
function calculateNodeRadius(nodeValue) {
    const absValue = Math.abs(nodeValue);
    
    // Avoid log of zero
    if (absValue === 0) {
        return 0.5; // Default minimum radius for nodes with no value
    }
    
    // Apply logarithmic scale: radius = 0.5 * log10(absValue)
    const radius = 0.5 * Math.log10(absValue);
    
    // Ensure minimum radius for visibility
    // For values < 10, log10 will be < 1, so 0.5 * log10 will be < 0.5
    return Math.max(radius, 0.5);
}

// Helper function to calculate 3D hierarchical layout based on connectivity
function calculateHierarchicalLayout(nodes, edges) {
    // Calculate connectivity for each node (incoming + outgoing edges)
    const nodeConnections = {};
    nodes.forEach(node => {
        nodeConnections[node.id] = { incoming: 0, outgoing: 0, total: 0 };
    });
    
    edges.forEach(edge => {
        if (nodeConnections[edge.from]) {
            nodeConnections[edge.from].outgoing++;
            nodeConnections[edge.from].total++;
        }
        if (nodeConnections[edge.to]) {
            nodeConnections[edge.to].incoming++;
            nodeConnections[edge.to].total++;
        }
    });
    
    // Calculate node values
    const nodeValues = calculateNodeValues(nodes, edges);
    
    // Sort nodes by total connections (descending)
    const sortedNodes = [...nodes].sort((a, b) => {
        return nodeConnections[b.id].total - nodeConnections[a.id].total;
    });
    
    // Define spherical layers based on connectivity
    // Central node at origin, then arrange in concentric spheres
    const positionedNodes = [];
    let currentRadius = 0;
    let nodesPerLayer = 1;
    let nodesInCurrentLayer = 0;
    let layerIndex = 0;
    
    sortedNodes.forEach((node, index) => {
        const nodeValue = nodeValues[node.id];
        
        if (index === 0) {
            // Central node at origin
            positionedNodes.push({
                ...node,
                position: new Vector3(0, 0, 0),
                color: getColorForType(node.type),
                radius: calculateNodeRadius(nodeValue),
                value: nodeValue
            });
            currentRadius = 5;  // Start first layer at radius 5
        } else {
            // Distribute other nodes in 3D spherical layers
            if (nodesInCurrentLayer >= nodesPerLayer) {
                // Move to next layer
                layerIndex++;
                currentRadius += 5;
                nodesInCurrentLayer = 0;
                // Each layer can hold more nodes
                nodesPerLayer = Math.ceil(8 + layerIndex * 4);
            }
            
            // Calculate spherical coordinates
            // Use golden angle spiral for even distribution
            const phi = Math.acos(1 - 2 * (nodesInCurrentLayer + 0.5) / nodesPerLayer);
            const theta = Math.PI * (1 + Math.sqrt(5)) * nodesInCurrentLayer;
            
            const x = currentRadius * Math.sin(phi) * Math.cos(theta);
            const y = currentRadius * Math.cos(phi);
            const z = currentRadius * Math.sin(phi) * Math.sin(theta);
            
            positionedNodes.push({
                ...node,
                position: new Vector3(x, y, z),
                color: getColorForType(node.type),
                radius: calculateNodeRadius(nodeValue),
                value: nodeValue
            });
            
            nodesInCurrentLayer++;
        }
    });
    
    return positionedNodes;
}

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
    const nodeMeshes = {};
    const nodeLabels = {};
    nodes.forEach(node => {
        const sphere = MeshBuilder.CreateSphere(
            `node-${node.id}`,
            { diameter: node.radius * 2 },
            scene
        );
        sphere.position = node.position;
        
        const material = new StandardMaterial(`material-${node.id}`, scene);
        material.diffuseColor = node.color;
        material.specularColor = new Color3(0.2, 0.2, 0.2);
        sphere.material = material;
        
        nodeMeshes[node.id] = sphere;
        
        // Store node data for later label creation
        nodeLabels[node.id] = { node, sphere };
    });

    // Helper function to create arrow (cylinder + cone)
    function createArrow(from, to, scene) {
        const direction = to.subtract(from);
        const length = direction.length();
        
        // Create cylinder for arrow shaft
        const cylinder = MeshBuilder.CreateCylinder(
            'arrow-shaft',
            { 
                height: length * 0.7, 
                diameter: 0.1 
            },
            scene
        );
        
        // Position and orient the cylinder
        cylinder.position = Vector3.Lerp(from, to, 0.35);
        
        // Calculate rotation to align with direction
        const axis = direction.normalize();
        const angle = Math.acos(Vector3.Dot(axis, Vector3.Up()));
        const rotationAxis = Vector3.Cross(Vector3.Up(), axis);
        if (rotationAxis.length() > 0) {
            const normalizedRotationAxis = rotationAxis.normalize();
            cylinder.rotationQuaternion = null;
            cylinder.rotate(normalizedRotationAxis, angle);
        }
        
        // Create cone for arrowhead
        const cone = MeshBuilder.CreateCylinder(
            'arrow-head',
            { 
                height: 0.5, 
                diameterTop: 0,
                diameterBottom: 0.3 
            },
            scene
        );
        
        // Position and orient the cone
        cone.position = Vector3.Lerp(from, to, 0.75);
        if (rotationAxis.length() > 0) {
            const normalizedRotationAxis = rotationAxis.normalize();
            cone.rotationQuaternion = null;
            cone.rotate(normalizedRotationAxis, angle);
        }
        
        // Material for arrows
        const arrowMaterial = new StandardMaterial('arrow-material', scene);
        arrowMaterial.diffuseColor = new Color3(0.7, 0.7, 0.7);
        cylinder.material = arrowMaterial;
        cone.material = arrowMaterial;
        
        return { shaft: cylinder, head: cone };
    }

    // Create edges as directed arrows
    edges.forEach((edge, index) => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        
        if (fromNode && toNode) {
            // Calculate start and end points (offset from sphere surface)
            const direction = toNode.position.subtract(fromNode.position).normalize();
            const startPoint = fromNode.position.add(direction.scale(fromNode.radius));
            const endPoint = toNode.position.subtract(direction.scale(toNode.radius));
            
            createArrow(startPoint, endPoint, scene);
        }
    });

    // Create GUI for labels
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
    const labelTextBlocks = {};
    let labelsVisible = false;

    // Function to create all labels (called once during initialization)
    function createAllLabels() {
        Object.keys(nodeLabels).forEach(nodeId => {
            const { node, sphere } = nodeLabels[nodeId];
            
            const label = new GUI.TextBlock();
            // Display node value in brackets next to the node name
            label.text = `${node.name} (${node.value})`;
            label.color = 'white';
            label.fontSize = 14;
            label.outlineWidth = 2;
            label.outlineColor = 'black';
            label.isVisible = labelsVisible;
            advancedTexture.addControl(label);
            label.linkWithMesh(sphere);
            label.linkOffsetY = -30; // Position above the sphere
            labelTextBlocks[nodeId] = label;
        });
    }

    // Function to update label visibility
    function updateLabelVisibility() {
        Object.keys(labelTextBlocks).forEach(nodeId => {
            labelTextBlocks[nodeId].isVisible = labelsVisible;
        });
    }

    // Function to toggle labels
    function toggleLabels() {
        labelsVisible = !labelsVisible;
        updateLabelVisibility();
        
        // Update button text
        if (toggleButton.children && toggleButton.children.length > 0) {
            toggleButton.children[0].text = labelsVisible ? 'Hide Labels (L)' : 'Show Labels (L)';
        }
    }

    // Create toggle button
    const toggleButton = GUI.Button.CreateSimpleButton('toggleLabels', 'Show Labels (L)');
    toggleButton.width = '150px';
    toggleButton.height = '40px';
    toggleButton.color = 'white';
    toggleButton.cornerRadius = 5;
    toggleButton.background = 'rgba(0, 0, 0, 0.5)';
    toggleButton.thickness = 2;
    toggleButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    toggleButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    toggleButton.top = '10px';
    toggleButton.left = '-10px';
    toggleButton.onPointerClickObservable.add(toggleLabels);
    advancedTexture.addControl(toggleButton);

    // Initialize labels (create them once, hidden by default)
    createAllLabels();

    // Add keyboard shortcut for 'L' key
    const handleKeydown = (event) => {
        if (event.key === 'l' || event.key === 'L') {
            toggleLabels();
        }
    };
    window.addEventListener('keydown', handleKeydown);
    
    // Return cleanup function for proper resource management
    return {
        dispose: () => {
            window.removeEventListener('keydown', handleKeydown);
            advancedTexture.dispose();
        }
    };
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
