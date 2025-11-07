import { describe, it, expect } from 'vitest';
import { calculateHierarchicalLayout } from '../src/layoutAlgorithm.js';

describe('layoutAlgorithm', () => {
    describe('calculateHierarchicalLayout', () => {
        it('should position single node at origin', () => {
            const nodes = [
                { id: 'single', name: 'Single', type: 'primary' }
            ];
            const edges = [];

            const positioned = calculateHierarchicalLayout(nodes, edges);

            expect(positioned).toHaveLength(1);
            expect(positioned[0].position.x).toBe(0);
            expect(positioned[0].position.y).toBe(0);
            expect(positioned[0].position.z).toBe(0);
        });

        it('should add color and radius to positioned nodes', () => {
            const nodes = [
                { id: 'node1', name: 'Node 1', type: 'primary' }
            ];
            const edges = [];

            const positioned = calculateHierarchicalLayout(nodes, edges);

            expect(positioned[0]).toHaveProperty('color');
            expect(positioned[0]).toHaveProperty('radius');
            expect(positioned[0]).toHaveProperty('value');
            expect(positioned[0]).toHaveProperty('position');
        });

        it('should place most connected node at center', () => {
            const nodes = [
                { id: 'central', name: 'Central', type: 'primary' },
                { id: 'peripheral', name: 'Peripheral', type: 'secondary' }
            ];
            const edges = [
                { from: 'central', to: 'peripheral', weight: 100 }
            ];

            const positioned = calculateHierarchicalLayout(nodes, edges);

            // Central node should be first (at origin)
            const centralNode = positioned.find(n => n.id === 'central');
            expect(centralNode.position.x).toBe(0);
            expect(centralNode.position.y).toBe(0);
            expect(centralNode.position.z).toBe(0);
        });

        it('should position multiple nodes in layers', () => {
            const nodes = [
                { id: 'A', name: 'A', type: 'primary' },
                { id: 'B', name: 'B', type: 'secondary' },
                { id: 'C', name: 'C', type: 'tertiary' }
            ];
            const edges = [
                { from: 'A', to: 'B', weight: 100 },
                { from: 'A', to: 'C', weight: 50 }
            ];

            const positioned = calculateHierarchicalLayout(nodes, edges);

            expect(positioned).toHaveLength(3);
            
            // Node A should be at center (most connected)
            const nodeA = positioned.find(n => n.id === 'A');
            expect(nodeA.position.x).toBe(0);
            expect(nodeA.position.y).toBe(0);
            expect(nodeA.position.z).toBe(0);

            // Other nodes should be positioned away from center
            const nodeB = positioned.find(n => n.id === 'B');
            const nodeC = positioned.find(n => n.id === 'C');
            
            const distanceB = Math.sqrt(
                nodeB.position.x ** 2 + 
                nodeB.position.y ** 2 + 
                nodeB.position.z ** 2
            );
            const distanceC = Math.sqrt(
                nodeC.position.x ** 2 + 
                nodeC.position.y ** 2 + 
                nodeC.position.z ** 2
            );
            
            // Both should be at a distance from center (could be first or second layer depending on sorting)
            expect(distanceB).toBeGreaterThan(0);
            expect(distanceC).toBeGreaterThan(0);
        });

        it('should preserve original node properties', () => {
            const nodes = [
                { id: 'test', name: 'Test Node', type: 'primary', tags: ['tag1', 'tag2'] }
            ];
            const edges = [];

            const positioned = calculateHierarchicalLayout(nodes, edges);

            expect(positioned[0].id).toBe('test');
            expect(positioned[0].name).toBe('Test Node');
            expect(positioned[0].type).toBe('primary');
            expect(positioned[0].tags).toEqual(['tag1', 'tag2']);
        });

        it('should calculate correct node values based on edges', () => {
            const nodes = [
                { id: 'source', name: 'Source', type: 'primary' },
                { id: 'target', name: 'Target', type: 'secondary' }
            ];
            const edges = [
                { from: 'source', to: 'target', weight: 100 }
            ];

            const positioned = calculateHierarchicalLayout(nodes, edges);

            const sourceNode = positioned.find(n => n.id === 'source');
            const targetNode = positioned.find(n => n.id === 'target');
            
            expect(sourceNode.value).toBe(100); // Only outgoing
            expect(targetNode.value).toBe(100); // Only incoming
        });
    });
});
