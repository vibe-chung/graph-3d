import { describe, it, expect } from 'vitest';
import { 
    getColorForType, 
    calculateNodeValues, 
    calculateNodeRadius,
    classifyNode,
    isIntermediateNode,
    updateCurrentValuesForDate
} from '../src/nodeUtils.js';

describe('nodeUtils', () => {
    describe('getColorForType', () => {
        it('should return red color for primary type', () => {
            const color = getColorForType('primary');
            expect(color.r).toBe(1);
            expect(color.g).toBe(0.3);
            expect(color.b).toBe(0.3);
        });

        it('should return green color for secondary type', () => {
            const color = getColorForType('secondary');
            expect(color.r).toBe(0.3);
            expect(color.g).toBe(1);
            expect(color.b).toBe(0.3);
        });

        it('should return blue color for tertiary type', () => {
            const color = getColorForType('tertiary');
            expect(color.r).toBe(0.3);
            expect(color.g).toBe(0.3);
            expect(color.b).toBe(1);
        });

        it('should return yellow color for unknown type', () => {
            const color = getColorForType('unknown');
            expect(color.r).toBe(0.8);
            expect(color.g).toBe(0.8);
            expect(color.b).toBe(0.3);
        });

        it('should return yellow color for default type', () => {
            const color = getColorForType('default');
            expect(color.r).toBe(0.8);
            expect(color.g).toBe(0.8);
            expect(color.b).toBe(0.3);
        });
    });

    describe('calculateNodeValues', () => {
        it('should calculate correct values for source nodes', () => {
            const nodes = [
                { id: 'source', name: 'Source' },
                { id: 'target', name: 'Target' }
            ];
            const edges = [
                { from: 'source', to: 'target', weight: 100 }
            ];

            const values = calculateNodeValues(nodes, edges);
            expect(values.source).toBe(100); // Source: only outgoing
            expect(values.target).toBe(100); // Sink: only incoming
        });

        it('should calculate correct values for intermediate nodes', () => {
            const nodes = [
                { id: 'A', name: 'A' },
                { id: 'B', name: 'B' },
                { id: 'C', name: 'C' }
            ];
            const edges = [
                { from: 'A', to: 'B', weight: 100 },
                { from: 'B', to: 'C', weight: 50 }
            ];

            const values = calculateNodeValues(nodes, edges);
            expect(values.A).toBe(100); // Source
            expect(values.B).toBe(0); // Intermediate: uses currentValue (defaults to 0)
            expect(values.C).toBe(50); // Sink
        });

        it('should return 0 for disconnected nodes', () => {
            const nodes = [
                { id: 'disconnected', name: 'Disconnected' }
            ];
            const edges = [];

            const values = calculateNodeValues(nodes, edges);
            expect(values.disconnected).toBe(0);
        });

        it('should handle multiple incoming and outgoing edges', () => {
            const nodes = [
                { id: 'A', name: 'A' },
                { id: 'B', name: 'B' },
                { id: 'C', name: 'C' }
            ];
            const edges = [
                { from: 'A', to: 'B', weight: 100 },
                { from: 'A', to: 'C', weight: 50 },
                { from: 'B', to: 'C', weight: 30 }
            ];

            const values = calculateNodeValues(nodes, edges);
            expect(values.A).toBe(150); // Source: 100 + 50 outgoing
            expect(values.B).toBe(0); // Intermediate: uses currentValue (defaults to 0)
            expect(values.C).toBe(80); // Sink: 50 + 30 incoming
        });
    });

    describe('calculateNodeRadius', () => {
        it('should return minimum radius for zero value', () => {
            const radius = calculateNodeRadius(0);
            expect(radius).toBe(0.5);
        });

        it('should return minimum radius for small values', () => {
            const radius = calculateNodeRadius(5);
            expect(radius).toBe(0.5); // log10(5) ≈ 0.699, 0.5 * 0.699 ≈ 0.349, max(0.349, 0.5) = 0.5
        });

        it('should calculate logarithmic radius for value of 10', () => {
            const radius = calculateNodeRadius(10);
            expect(radius).toBeCloseTo(0.5, 1); // log10(10) = 1, 0.5 * 1 = 0.5
        });

        it('should calculate logarithmic radius for value of 100', () => {
            const radius = calculateNodeRadius(100);
            expect(radius).toBeCloseTo(1.0, 1); // log10(100) = 2, 0.5 * 2 = 1.0
        });

        it('should calculate logarithmic radius for value of 1000', () => {
            const radius = calculateNodeRadius(1000);
            expect(radius).toBeCloseTo(1.5, 1); // log10(1000) = 3, 0.5 * 3 = 1.5
        });

        it('should handle negative values using absolute value', () => {
            const radius = calculateNodeRadius(-100);
            expect(radius).toBeCloseTo(1.0, 1); // log10(100) = 2, 0.5 * 2 = 1.0
        });
    });

    describe('classifyNode', () => {
        it('should classify source node correctly', () => {
            const edges = [
                { from: 'A', to: 'B', weight: 100 }
            ];
            expect(classifyNode('A', edges)).toBe('source');
        });

        it('should classify sink node correctly', () => {
            const edges = [
                { from: 'A', to: 'B', weight: 100 }
            ];
            expect(classifyNode('B', edges)).toBe('sink');
        });

        it('should classify intermediate node correctly', () => {
            const edges = [
                { from: 'A', to: 'B', weight: 100 },
                { from: 'B', to: 'C', weight: 50 }
            ];
            expect(classifyNode('B', edges)).toBe('intermediate');
        });

        it('should classify disconnected node correctly', () => {
            const edges = [
                { from: 'A', to: 'B', weight: 100 }
            ];
            expect(classifyNode('C', edges)).toBe('disconnected');
        });
    });

    describe('isIntermediateNode', () => {
        it('should return true for intermediate node', () => {
            const edges = [
                { from: 'A', to: 'B', weight: 100 },
                { from: 'B', to: 'C', weight: 50 }
            ];
            expect(isIntermediateNode('B', edges)).toBe(true);
        });

        it('should return false for source node', () => {
            const edges = [
                { from: 'A', to: 'B', weight: 100 }
            ];
            expect(isIntermediateNode('A', edges)).toBe(false);
        });

        it('should return false for sink node', () => {
            const edges = [
                { from: 'A', to: 'B', weight: 100 }
            ];
            expect(isIntermediateNode('B', edges)).toBe(false);
        });
    });

    describe('updateCurrentValuesForDate', () => {
        it('should increment currentValue for target intermediate node when moving forward', () => {
            const nodes = [
                { id: 'A', name: 'A' },
                { id: 'B', name: 'B', currentValue: 100 },
                { id: 'C', name: 'C' }
            ];
            const edges = [
                { from: 'A', to: 'B', weight: 50, dayOfMonth: 15 },
                { from: 'B', to: 'C', weight: 30, dayOfMonth: 15 }
            ];
            
            updateCurrentValuesForDate(nodes, edges, 15, 1);
            
            expect(nodes[1].currentValue).toBe(120); // 100 + 50 (incoming) - 30 (outgoing)
        });

        it('should decrement currentValue for source intermediate node when moving forward', () => {
            const nodes = [
                { id: 'A', name: 'A' },
                { id: 'B', name: 'B', currentValue: 100 },
                { id: 'C', name: 'C' }
            ];
            const edges = [
                { from: 'A', to: 'B', weight: 50, dayOfMonth: 15 },
                { from: 'B', to: 'C', weight: 30, dayOfMonth: 15 }
            ];
            
            updateCurrentValuesForDate(nodes, edges, 15, 1);
            
            expect(nodes[1].currentValue).toBe(120); // 100 + 50 - 30
        });

        it('should reverse updates when moving backward', () => {
            const nodes = [
                { id: 'A', name: 'A' },
                { id: 'B', name: 'B', currentValue: 100 },
                { id: 'C', name: 'C' }
            ];
            const edges = [
                { from: 'A', to: 'B', weight: 50, dayOfMonth: 15 },
                { from: 'B', to: 'C', weight: 30, dayOfMonth: 15 }
            ];
            
            updateCurrentValuesForDate(nodes, edges, 15, -1);
            
            expect(nodes[1].currentValue).toBe(80); // 100 - 50 + 30
        });

        it('should initialize currentValue to 0 if undefined', () => {
            const nodes = [
                { id: 'A', name: 'A' },
                { id: 'B', name: 'B' },
                { id: 'C', name: 'C' }
            ];
            const edges = [
                { from: 'A', to: 'B', weight: 50, dayOfMonth: 15 },
                { from: 'B', to: 'C', weight: 30, dayOfMonth: 15 }
            ];
            
            updateCurrentValuesForDate(nodes, edges, 15, 1);
            
            expect(nodes[1].currentValue).toBe(20); // 0 + 50 - 30
        });

        it('should only update nodes with matching dayOfMonth', () => {
            const nodes = [
                { id: 'A', name: 'A' },
                { id: 'B', name: 'B', currentValue: 100 },
                { id: 'C', name: 'C' }
            ];
            const edges = [
                { from: 'A', to: 'B', weight: 50, dayOfMonth: 15 },
                { from: 'B', to: 'C', weight: 30, dayOfMonth: 20 }
            ];
            
            updateCurrentValuesForDate(nodes, edges, 15, 1);
            
            expect(nodes[1].currentValue).toBe(150); // Only incoming edge on day 15
        });

        it('should not update source or sink nodes', () => {
            const nodes = [
                { id: 'A', name: 'A', currentValue: 100 },
                { id: 'B', name: 'B', currentValue: 100 }
            ];
            const edges = [
                { from: 'A', to: 'B', weight: 50, dayOfMonth: 15 }
            ];
            
            updateCurrentValuesForDate(nodes, edges, 15, 1);
            
            // Source and sink nodes should not be updated
            expect(nodes[0].currentValue).toBe(100);
            expect(nodes[1].currentValue).toBe(100);
        });
    });

    describe('calculateNodeValues with currentValue', () => {
        it('should use currentValue for intermediate nodes', () => {
            const nodes = [
                { id: 'A', name: 'A' },
                { id: 'B', name: 'B', currentValue: 250 },
                { id: 'C', name: 'C' }
            ];
            const edges = [
                { from: 'A', to: 'B', weight: 100 },
                { from: 'B', to: 'C', weight: 50 }
            ];

            const values = calculateNodeValues(nodes, edges);
            expect(values.A).toBe(100); // Source
            expect(values.B).toBe(250); // Intermediate: uses currentValue
            expect(values.C).toBe(50); // Sink
        });

        it('should default to 0 for intermediate nodes without currentValue', () => {
            const nodes = [
                { id: 'A', name: 'A' },
                { id: 'B', name: 'B' },
                { id: 'C', name: 'C' }
            ];
            const edges = [
                { from: 'A', to: 'B', weight: 100 },
                { from: 'B', to: 'C', weight: 50 }
            ];

            const values = calculateNodeValues(nodes, edges);
            expect(values.B).toBe(0); // Intermediate: defaults to 0
        });
    });
});
