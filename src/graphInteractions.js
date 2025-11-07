import { PointerEventTypes } from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

// Function to get connected nodes for a given node
function getConnectedNodes(nodeId, edges) {
    const connected = new Set();
    connected.add(nodeId); // Include the selected node itself
    
    edges.forEach(edge => {
        if (edge.from === nodeId) {
            connected.add(edge.to);
        }
        if (edge.to === nodeId) {
            connected.add(edge.from);
        }
    });
    
    return connected;
}

// Set up GUI and user interactions
export function setupInteractions(scene, nodeLabels, nodeMeshes, edgeMeshes, edges) {
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

    // Node selection state
    let selectedNodeId = null;

    // Function to update visibility based on selection
    function updateVisibility() {
        if (selectedNodeId === null) {
            // Show all nodes and edges
            Object.keys(nodeMeshes).forEach(nodeId => {
                nodeMeshes[nodeId].isVisible = true;
            });
            edgeMeshes.forEach(edgeMesh => {
                edgeMesh.shaft.isVisible = true;
                edgeMesh.head.isVisible = true;
            });
            // Update label visibility - show all labels if labels are visible
            Object.keys(labelTextBlocks).forEach(nodeId => {
                labelTextBlocks[nodeId].isVisible = labelsVisible;
            });
        } else {
            // Show only connected nodes and edges
            const connectedNodes = getConnectedNodes(selectedNodeId, edges);
            
            // Update node visibility
            Object.keys(nodeMeshes).forEach(nodeId => {
                nodeMeshes[nodeId].isVisible = connectedNodes.has(nodeId);
            });
            
            // Update edge visibility - show only edges between visible nodes
            edgeMeshes.forEach(edgeMesh => {
                const shouldBeVisible = connectedNodes.has(edgeMesh.from) && connectedNodes.has(edgeMesh.to);
                edgeMesh.shaft.isVisible = shouldBeVisible;
                edgeMesh.head.isVisible = shouldBeVisible;
            });
            
            // Update label visibility - show only labels of visible nodes if labels are visible
            Object.keys(labelTextBlocks).forEach(nodeId => {
                labelTextBlocks[nodeId].isVisible = labelsVisible && connectedNodes.has(nodeId);
            });
        }
    }

    // Add click handling for node selection
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
            const pickResult = pointerInfo.pickInfo;
            if (pickResult.hit && pickResult.pickedMesh) {
                const meshName = pickResult.pickedMesh.name;
                // Check if it's a node (mesh name starts with "node-")
                if (meshName.startsWith('node-')) {
                    const nodeId = meshName.substring(5); // Remove "node-" prefix
                    
                    // Toggle selection
                    if (selectedNodeId === nodeId) {
                        // Deselect
                        selectedNodeId = null;
                    } else {
                        // Select
                        selectedNodeId = nodeId;
                    }
                    
                    updateVisibility();
                }
            }
        }
    });
    
    // Return cleanup function for proper resource management
    return {
        dispose: () => {
            window.removeEventListener('keydown', handleKeydown);
            advancedTexture.dispose();
        }
    };
}
