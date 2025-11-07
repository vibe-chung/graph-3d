// Configuration for different data sources
const configs = {
    default: {
        nodes: '../nodes.json',
        edges: '../edges.json'
    },
    example: {
        nodes: '../nodes.example.json',
        edges: '../edges.example.json'
    },
    private: {
        nodes: '../private.nodes.json',
        edges: '../private.edges.json'
    }
};

// Get configuration from query parameter or use default
export function getConfig() {
    const urlParams = new URLSearchParams(window.location.search);
    const configName = urlParams.get('config');
    
    if (configName && configs[configName]) {
        return configs[configName];
    }
    
    return configs.default;
}

// Load JSON data from URL
export async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}
