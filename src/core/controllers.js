import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';


let rightController;

export function initControllers(renderer, scene) {

    rightController = renderer.xr.getController(1);
    scene.add(rightController);

    // Laser
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(0,0,-1)
    ]);

    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color:0x00ffff }));
    line.scale.z = 10;

    rightController.add(line);
}

export function updateControllers() {
    // später für Auswahl
}
