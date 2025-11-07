import {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    Vector3,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Color4
} from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials/grid';

// Create and configure the Babylon.js scene
export function createScene(canvas) {
    // Create the Babylon.js engine
    const engine = new Engine(canvas, true);

    // Create scene
    const scene = new Scene(engine);
    // Use a gradient background similar to Unity editor (darker at bottom, lighter at top)
    scene.clearColor = new Color4(0.15, 0.18, 0.25, 1.0);

    // Create camera
    const camera = new ArcRotateCamera(
        'camera',
        -Math.PI / 2,
        Math.PI / 3,
        20,
        Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);

    // Create light
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // Create ground plane with grid (Unity-like)
    const ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, scene);
    ground.position.y = -10; // Place below the nodes

    // Create and apply grid material
    const groundMaterial = new GridMaterial('groundMaterial', scene);
    groundMaterial.gridRatio = 1.0; // Grid cell size
    groundMaterial.majorUnitFrequency = 5; // Bold lines every 5 units
    groundMaterial.minorUnitVisibility = 0.45; // Minor grid line visibility
    groundMaterial.mainColor = new Color3(0.2, 0.25, 0.35); // Grid area color (bluish gray)
    groundMaterial.lineColor = new Color3(0.4, 0.45, 0.55); // Grid line color (lighter bluish)
    groundMaterial.opacity = 0.98;
    ground.material = groundMaterial;

    // Create sky dome for Unity-like atmosphere
    const skybox = MeshBuilder.CreateBox('skyBox', { size: 1000.0 }, scene);
    const skyboxMaterial = new StandardMaterial('skyBoxMaterial', scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.emissiveColor = new Color3(0.2, 0.25, 0.35); // Sky color matching scene background
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = false;

    return { engine, scene, camera };
}
