import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { createPoint } from './points.js';

let controller;
let line;

export function initInteraction(renderer, rig, scene) {

    controller = renderer.xr.getController(1); // ✅ rechter Controller
    rig.add(controller);

    // Laser
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(0,0,-1)
    ]);

    line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: 0xff0000 })
    );

    line.scale.z = 5;
    controller.add(line);

    // Trigger → Punkt erstellen
    controller.addEventListener('selectstart', () => {

        const input = prompt("Punkt eingeben (Format: x,y,z)");

        if (!input) return;

        const parts = input.split(',').map(Number);

        if (parts.length !== 3 || parts.some(isNaN)) {
            alert("Ungültiges Format!");
            return;
        }

        const [x, y, z] = parts;

        createPoint(x, y, z);
    });
}

export function updateInteraction() {
    // aktuell nichts nötig (Laser ist statisch)
}
