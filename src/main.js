import { 
    Engine, 
    Scene, 
    ArcRotateCamera, 
    HemisphericLight, 
    Vector3, 
    MeshBuilder,
    StandardMaterial,
    Color3
} from '@babylonjs/core';

// Import JSON data
import nodesData from '../nodes.json';
import edgesData from '../edges.json';

// Create the Babylon.js engine
const canvas = document.getElementById('renderCanvas');
const engine = new Engine(canvas, true);

// Create scene
const scene = new Scene(engine);
scene.clearColor = new Color3(0.1, 0.1, 0.15);

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

// Helper function to calculate circular layout positions
function calculateCircularLayout(nodes, radius = 8) {
    const angleStep = (2 * Math.PI) / nodes.length;
    return nodes.map((node, index) => {
        const angle = index * angleStep;
        return {
            ...node,
            position: new Vector3(
                radius * Math.cos(angle),
                0,
                radius * Math.sin(angle)
            ),
            color: getColorForType(node.type),
            radius: 1.0  // Default radius for all nodes
        };
    });
}

// Convert JSON data to internal format
const nodes = calculateCircularLayout(nodesData);

// Convert edges from JSON format (source/target) to internal format (from/to with node ids)
const edges = edgesData.map(edge => ({
    from: edge.source,
    to: edge.target,
    weight: edge.weight || 0,
    type: edge.type || 'default',
    dayOfMonth: edge.dayOfMonth || null,
    tags: edge.tags || [],
    notes: edge.notes || ''
}));

// Create nodes as spheres
const nodeMeshes = {};
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

// Run the render loop
engine.runRenderLoop(() => {
    scene.render();
});

// Handle window resize
window.addEventListener('resize', () => {
    engine.resize();
});
