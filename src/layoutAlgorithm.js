import { Vector3 } from '@babylonjs/core';
import { getColorForType, calculateNodeValues, calculateNodeRadius } from './nodeUtils.js';

// Helper function to calculate 3D hierarchical layout based on connectivity
export function calculateHierarchicalLayout(nodes, edges) {
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
