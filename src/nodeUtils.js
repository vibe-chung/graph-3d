import { Color3 } from '@babylonjs/core';

// Helper function to generate colors based on node type
export function getColorForType(type) {
    const colorMap = {
        'primary': new Color3(1, 0.3, 0.3),      // Red
        'secondary': new Color3(0.3, 1, 0.3),    // Green
        'tertiary': new Color3(0.3, 0.3, 1),     // Blue
        'default': new Color3(0.8, 0.8, 0.3)     // Yellow
    };
    return colorMap[type] || colorMap.default;
}

// Helper function to calculate node values based on edge weights
export function calculateNodeValues(nodes, edges) {
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
export function calculateNodeRadius(nodeValue) {
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
