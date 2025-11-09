import { PointerEventTypes } from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { createDateState, formatDate } from './dateState.js';

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
        updateVisibility();
        
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
    toggleButton.isPointerBlocker = true;
    toggleButton.onPointerClickObservable.add(toggleLabels);
    advancedTexture.addControl(toggleButton);

    // Initialize labels (create them once, hidden by default)
    createAllLabels();

    // ===== Date Controls =====
    
    // Create date state manager
    const dateState = createDateState();

    // Date display at the top of the screen
    const dateDisplay = new GUI.TextBlock();
    dateDisplay.text = formatDate(dateState.getDate());
    dateDisplay.color = 'white';
    dateDisplay.fontSize = 24;
    dateDisplay.fontWeight = 'bold';
    dateDisplay.outlineWidth = 3;
    dateDisplay.outlineColor = 'black';
    dateDisplay.height = '40px';
    dateDisplay.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    dateDisplay.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    dateDisplay.top = '10px';
    dateDisplay.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    dateDisplay.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(dateDisplay);

    // Update date display when state changes
    dateState.onUpdate((state) => {
        dateDisplay.text = formatDate(state.date);
        // Update play/pause button text
        if (playPauseButton.children && playPauseButton.children.length > 0) {
            playPauseButton.children[0].text = state.isPlaying ? '⏸' : '▶';
        }
        // Update speed button text
        if (speedButton.children && speedButton.children.length > 0) {
            speedButton.children[0].text = `${state.speedMultiplier}x`;
        }
    });

    // Control panel at the bottom
    const controlPanel = new GUI.StackPanel();
    controlPanel.isVertical = false;
    controlPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    controlPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    controlPanel.top = '-20px';
    controlPanel.height = '50px';
    advancedTexture.addControl(controlPanel);

    // Previous day button
    const prevButton = GUI.Button.CreateSimpleButton('prevDay', '◀');
    prevButton.width = '50px';
    prevButton.height = '50px';
    prevButton.color = 'white';
    prevButton.cornerRadius = 5;
    prevButton.background = 'rgba(0, 0, 0, 0.5)';
    prevButton.thickness = 2;
    prevButton.fontSize = 24;
    prevButton.onPointerClickObservable.add(() => {
        dateState.previousDay();
    });
    controlPanel.addControl(prevButton);

    // Spacer
    const spacer1 = new GUI.Container();
    spacer1.width = '10px';
    controlPanel.addControl(spacer1);

    // Play/Pause button
    const playPauseButton = GUI.Button.CreateSimpleButton('playPause', '▶');
    playPauseButton.width = '50px';
    playPauseButton.height = '50px';
    playPauseButton.color = 'white';
    playPauseButton.cornerRadius = 5;
    playPauseButton.background = 'rgba(0, 0, 0, 0.5)';
    playPauseButton.thickness = 2;
    playPauseButton.fontSize = 24;
    playPauseButton.onPointerClickObservable.add(() => {
        dateState.togglePlayPause();
    });
    controlPanel.addControl(playPauseButton);

    // Spacer
    const spacer2 = new GUI.Container();
    spacer2.width = '10px';
    controlPanel.addControl(spacer2);

    // Next day button
    const nextButton = GUI.Button.CreateSimpleButton('nextDay', '▶▶');
    nextButton.width = '50px';
    nextButton.height = '50px';
    nextButton.color = 'white';
    nextButton.cornerRadius = 5;
    nextButton.background = 'rgba(0, 0, 0, 0.5)';
    nextButton.thickness = 2;
    nextButton.fontSize = 24;
    nextButton.onPointerClickObservable.add(() => {
        dateState.nextDay();
    });
    controlPanel.addControl(nextButton);

    // Spacer
    const spacer3 = new GUI.Container();
    spacer3.width = '10px';
    controlPanel.addControl(spacer3);

    // Reset button
    const resetButton = GUI.Button.CreateSimpleButton('reset', '↻');
    resetButton.width = '50px';
    resetButton.height = '50px';
    resetButton.color = 'white';
    resetButton.cornerRadius = 5;
    resetButton.background = 'rgba(0, 0, 0, 0.5)';
    resetButton.thickness = 2;
    resetButton.fontSize = 28;
    resetButton.onPointerClickObservable.add(() => {
        dateState.reset();
    });
    controlPanel.addControl(resetButton);

    // Spacer
    const spacer4 = new GUI.Container();
    spacer4.width = '10px';
    controlPanel.addControl(spacer4);

    // Speed multiplier button
    const speedButton = GUI.Button.CreateSimpleButton('speed', '1x');
    speedButton.width = '50px';
    speedButton.height = '50px';
    speedButton.color = 'white';
    speedButton.cornerRadius = 5;
    speedButton.background = 'rgba(0, 0, 0, 0.5)';
    speedButton.thickness = 2;
    speedButton.fontSize = 18;
    speedButton.onPointerClickObservable.add(() => {
        dateState.toggleSpeed();
    });
    controlPanel.addControl(speedButton);

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
            dateState.dispose();
            advancedTexture.dispose();
        }
    };
}
