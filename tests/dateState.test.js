import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrentRealDate, formatDate, addDays, createDateState } from '../src/dateState.js';

// Mock requestAnimationFrame and cancelAnimationFrame for tests
global.requestAnimationFrame = vi.fn((callback) => {
    return setTimeout(callback, 16);
});
global.cancelAnimationFrame = vi.fn((id) => {
    clearTimeout(id);
});

describe('dateState', () => {
    describe('getCurrentRealDate', () => {
        it('should return current date at midnight', () => {
            const date = getCurrentRealDate();
            expect(date.getHours()).toBe(0);
            expect(date.getMinutes()).toBe(0);
            expect(date.getSeconds()).toBe(0);
            expect(date.getMilliseconds()).toBe(0);
        });
    });

    describe('formatDate', () => {
        it('should format date correctly', () => {
            const date = new Date(2025, 0, 15); // January 15, 2025
            const formatted = formatDate(date);
            expect(formatted).toBe('January 15, 2025');
        });

        it('should handle different months', () => {
            const date = new Date(2025, 11, 25); // December 25, 2025
            const formatted = formatDate(date);
            expect(formatted).toBe('December 25, 2025');
        });
    });

    describe('addDays', () => {
        it('should add positive days', () => {
            const date = new Date(2025, 0, 15);
            const newDate = addDays(date, 5);
            expect(newDate.getDate()).toBe(20);
            expect(newDate.getMonth()).toBe(0);
        });

        it('should subtract days with negative value', () => {
            const date = new Date(2025, 0, 15);
            const newDate = addDays(date, -5);
            expect(newDate.getDate()).toBe(10);
            expect(newDate.getMonth()).toBe(0);
        });

        it('should handle month transitions', () => {
            const date = new Date(2025, 0, 30);
            const newDate = addDays(date, 5);
            expect(newDate.getDate()).toBe(4);
            expect(newDate.getMonth()).toBe(1); // February
        });

        it('should not modify original date', () => {
            const date = new Date(2025, 0, 15);
            const originalDate = date.getDate();
            addDays(date, 5);
            expect(date.getDate()).toBe(originalDate);
        });
    });

    describe('createDateState', () => {
        let dateState;

        beforeEach(() => {
            dateState = createDateState();
        });

        afterEach(() => {
            if (dateState) {
                dateState.dispose();
            }
        });

        it('should initialize with current real date', () => {
            const currentDate = dateState.getDate();
            const realDate = getCurrentRealDate();
            expect(currentDate.toDateString()).toBe(realDate.toDateString());
        });

        it('should start in paused state', () => {
            expect(dateState.isPlaying()).toBe(false);
        });

        it('should start with 1x speed multiplier', () => {
            expect(dateState.getSpeedMultiplier()).toBe(1);
        });

        it('should increment date by one day', () => {
            const initialDate = new Date(dateState.getDate());
            dateState.nextDay();
            const newDate = dateState.getDate();
            expect(newDate.getDate()).toBe(initialDate.getDate() + 1);
        });

        it('should decrement date by one day', () => {
            const initialDate = new Date(dateState.getDate());
            dateState.previousDay();
            const newDate = dateState.getDate();
            expect(newDate.getDate()).toBe(initialDate.getDate() - 1);
        });

        it('should reset to current real date', () => {
            dateState.nextDay();
            dateState.nextDay();
            dateState.reset();
            const currentDate = dateState.getDate();
            const realDate = getCurrentRealDate();
            expect(currentDate.toDateString()).toBe(realDate.toDateString());
        });

        it('should set custom date', () => {
            const customDate = new Date(2025, 5, 15);
            dateState.setDate(customDate);
            const storedDate = dateState.getDate();
            expect(storedDate.getDate()).toBe(15);
            expect(storedDate.getMonth()).toBe(5);
            expect(storedDate.getFullYear()).toBe(2025);
        });

        it('should toggle play/pause', () => {
            expect(dateState.isPlaying()).toBe(false);
            dateState.togglePlayPause();
            expect(dateState.isPlaying()).toBe(true);
            dateState.togglePlayPause();
            expect(dateState.isPlaying()).toBe(false);
        });

        it('should toggle speed multiplier between 1x and 2x', () => {
            expect(dateState.getSpeedMultiplier()).toBe(1);
            dateState.toggleSpeed();
            expect(dateState.getSpeedMultiplier()).toBe(2);
            dateState.toggleSpeed();
            expect(dateState.getSpeedMultiplier()).toBe(1);
        });

        it('should call update callback when state changes', () => {
            const callback = vi.fn();
            dateState.onUpdate(callback);
            
            dateState.nextDay();
            expect(callback).toHaveBeenCalled();
            
            const lastCall = callback.mock.calls[callback.mock.calls.length - 1][0];
            expect(lastCall).toHaveProperty('date');
            expect(lastCall).toHaveProperty('isPlaying');
            expect(lastCall).toHaveProperty('speedMultiplier');
        });

        it('should set custom speed multiplier', () => {
            dateState.setSpeedMultiplier(2);
            expect(dateState.getSpeedMultiplier()).toBe(2);
        });
    });
});
