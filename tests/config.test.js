import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock window.location for testing
const mockLocation = {
    search: ''
};

describe('config', () => {
    beforeEach(async () => {
        // Reset modules before each test
        vi.resetModules();
        
        // Mock window.location
        global.window = {
            location: mockLocation
        };
        
        // Mock URLSearchParams
        global.URLSearchParams = class URLSearchParams {
            constructor(search) {
                this.params = new Map();
                if (search) {
                    const pairs = search.substring(1).split('&');
                    pairs.forEach(pair => {
                        if (pair) {
                            const [key, value] = pair.split('=');
                            this.params.set(key, value);
                        }
                    });
                }
            }
            get(key) {
                return this.params.get(key) || null;
            }
        };
    });

    describe('getConfig', () => {
        it('should return default config when no query parameter', async () => {
            mockLocation.search = '';
            const { getConfig } = await import('../src/config.js');
            const config = getConfig();
            
            expect(config.nodes).toBe('../nodes.json');
            expect(config.edges).toBe('../edges.json');
        });

        it('should return example config when config=example', async () => {
            mockLocation.search = '?config=example';
            const { getConfig } = await import('../src/config.js');
            const config = getConfig();
            
            expect(config.nodes).toBe('../nodes.example.json');
            expect(config.edges).toBe('../edges.example.json');
        });

        it('should return private config when config=private', async () => {
            mockLocation.search = '?config=private';
            const { getConfig } = await import('../src/config.js');
            const config = getConfig();
            
            expect(config.nodes).toBe('../private.nodes.json');
            expect(config.edges).toBe('../private.edges.json');
        });

        it('should return default config for invalid config name', async () => {
            mockLocation.search = '?config=invalid';
            const { getConfig } = await import('../src/config.js');
            const config = getConfig();
            
            expect(config.nodes).toBe('../nodes.json');
            expect(config.edges).toBe('../edges.json');
        });
    });

    describe('loadJSON', () => {
        beforeEach(() => {
            // Mock fetch
            global.fetch = vi.fn();
        });

        it('should successfully load JSON data', async () => {
            const mockData = { test: 'data' };
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => mockData
            });

            const { loadJSON } = await import('../src/config.js');
            const result = await loadJSON('test.json');
            
            expect(result).toEqual(mockData);
            expect(global.fetch).toHaveBeenCalledWith('test.json');
        });

        it('should throw error on failed request', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            });

            const { loadJSON } = await import('../src/config.js');
            
            await expect(loadJSON('missing.json')).rejects.toThrow(
                'Failed to load missing.json: 404 Not Found'
            );
        });
    });
});
