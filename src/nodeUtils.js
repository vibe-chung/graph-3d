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

// Helper function to classify node as source/sink/intermediate
export function classifyNode(nodeId, edges) {
    let hasIncoming = false;
    let hasOutgoing = false;
    
    edges.forEach(edge => {
        if (edge.from === nodeId) hasOutgoing = true;
        if (edge.to === nodeId) hasIncoming = true;
    });
    
    if (hasOutgoing && !hasIncoming) return 'source';
    if (hasIncoming && !hasOutgoing) return 'sink';
    if (hasIncoming && hasOutgoing) return 'intermediate';
    return 'disconnected';
}

// Helper function to check if a node is intermediate
export function isIntermediateNode(nodeId, edges) {
    return classifyNode(nodeId, edges) === 'intermediate';
}

// Helper function to calculate node values based on edge weights
// For intermediate nodes, uses currentValue from node data if present
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
            // Intermediate node: use currentValue from node data (default to 0)
            nodeValues[node.id] = node.currentValue !== undefined ? node.currentValue : 0;
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

// Helper function to update currentValue for intermediate nodes based on date changes
// direction: 1 for forward, -1 for backward
export function updateCurrentValuesForDate(nodes, edges, dayOfMonth, direction = 1) {
    // Filter edges that match the dayOfMonth
    const matchingEdges = edges.filter(edge => edge.dayOfMonth === dayOfMonth);
    
    // Update currentValue for each intermediate node affected by matching edges
    matchingEdges.forEach(edge => {
        // Check if source is intermediate node
        const sourceNode = nodes.find(n => n.id === edge.from);
        if (sourceNode && isIntermediateNode(edge.from, edges)) {
            // When moving forward, decrement (money flows out)
            // When moving backward, increment (reverse the transaction)
            if (sourceNode.currentValue === undefined) {
                sourceNode.currentValue = 0;
            }
            sourceNode.currentValue -= edge.weight * direction;
        }
        
        // Check if target is intermediate node
        const targetNode = nodes.find(n => n.id === edge.to);
        if (targetNode && isIntermediateNode(edge.to, edges)) {
            // When moving forward, increment (money flows in)
            // When moving backward, decrement (reverse the transaction)
            if (targetNode.currentValue === undefined) {
                targetNode.currentValue = 0;
            }
            targetNode.currentValue += edge.weight * direction;
        }
    });
}
