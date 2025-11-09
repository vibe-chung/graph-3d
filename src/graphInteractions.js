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

// Helper to create a Babylon GUI button with common styling and add to parent
function createGuiButton({ name, text, width = '50px', height = '50px', fontSize = 24, onClick, parent }) {
    const btn = GUI.Button.CreateSimpleButton(name, text);
    btn.width = width;
    btn.height = height;
    btn.color = 'white';
    btn.cornerRadius = 5;
    btn.background = 'rgba(0, 0, 0, 0.5)';
    btn.thickness = 2;
    btn.fontSize = fontSize;
    if (onClick) btn.onPointerClickObservable.add(onClick);
    if (parent) parent.addControl(btn);
    return btn;
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
        if (toggleLabelsButton.children && toggleLabelsButton.children.length > 0) {
            toggleLabelsButton.children[0].text = labelsVisible ? 'Hide Labels (L)' : 'Show Labels (L)';
        }
    }

    // Create toggle button
    const toggleLabelsButton = createGuiButton({
        name: 'toggleLabels',
        text: 'Show Labels (L)',
        width: '150px',
        height: '40px',
        fontSize: 18,
        onClick: toggleLabels
    });
    toggleLabelsButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    toggleLabelsButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    toggleLabelsButton.top = '10px';
    toggleLabelsButton.left = '-10px';
    toggleLabelsButton.isPointerBlocker = true;
    advancedTexture.addControl(toggleLabelsButton);

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
    const prevButton = createGuiButton({
        name: 'prevDay',
        text: '◀',
        onClick: () => dateState.previousDay(),
        parent: controlPanel
    });

    // Spacer
    const spacer1 = new GUI.Container();
    spacer1.width = '10px';
    controlPanel.addControl(spacer1);

    // Play/Pause button
    const playPauseButton = createGuiButton({
        name: 'playPause',
        text: '▶',
        onClick: () => dateState.togglePlayPause(),
        parent: controlPanel
    });

    // Spacer
    const spacer2 = new GUI.Container();
    spacer2.width = '10px';
    controlPanel.addControl(spacer2);

    // Next day button
    const nextButton = createGuiButton({
        name: 'nextDay',
        text: '▶▶',
        onClick: () => dateState.nextDay(),
        parent: controlPanel
    });

    // Spacer
    const spacer3 = new GUI.Container();
    spacer3.width = '10px';
    controlPanel.addControl(spacer3);

    // Reset button
    const resetButton = createGuiButton({
        name: 'reset',
        text: '↻',
        fontSize: 28,
        onClick: () => dateState.reset(),
        parent: controlPanel
    });

    // Spacer
    const spacer4 = new GUI.Container();
    spacer4.width = '10px';
    controlPanel.addControl(spacer4);

    // Speed multiplier button
    const speedButton = createGuiButton({
        name: 'speed',
        text: '1x',
        fontSize: 18,
        onClick: () => dateState.toggleSpeed(),
        parent: controlPanel
    });

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
