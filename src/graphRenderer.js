import {
    Vector3,
    MeshBuilder,
    StandardMaterial,
    Color3
} from '@babylonjs/core';

// Create nodes as spheres in the scene
export function createNodes(nodes, scene) {
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
    
    return { nodeMeshes, nodeLabels };
}

// Helper function to create arrow (cylinder + cone)
export function createArrow(from, to, scene) {
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

// Create edges as directed arrows and store them
export function createEdges(nodes, edges, scene) {
    const edgeMeshes = [];
    
    edges.forEach((edge, index) => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        
        if (fromNode && toNode) {
            // Calculate start and end points (offset from sphere surface)
            const direction = toNode.position.subtract(fromNode.position).normalize();
            const startPoint = fromNode.position.add(direction.scale(fromNode.radius));
            const endPoint = toNode.position.subtract(direction.scale(toNode.radius));
            
            const arrow = createArrow(startPoint, endPoint, scene);
            edgeMeshes.push({
                from: edge.from,
                to: edge.to,
                shaft: arrow.shaft,
                head: arrow.head
            });
        }
    });
    
    return edgeMeshes;
}
