// === TELEPORT SYSTEM ===
// Datei: src/core/teleport.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let controller;
let raycaster;
let tempMatrix;
let teleportMarker;
let floor;

export function initTeleport(renderer, scene, camera) {

    // === RAYCASTER (Laserstrahl) ===
    raycaster = new THREE.Raycaster();
    tempMatrix = new THREE.Matrix4();

    // === CONTROLLER (linke Hand = 0) ===
    controller = renderer.xr.getController(0);
    scene.add(controller);

    // === LASERSTRAHL VISUELL ===
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1)
    ]);

    const material = new THREE.LineBasicMaterial({ color: 0x00ffcc });

    const line = new THREE.Line(geometry, material);
    line.name = 'ray';
    line.scale.z = 5;
    controller.add(line);

    // === BODEN ===
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 1
    });

    floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // === TELEPORT MARKER (wo du hinzielst) ===
    const markerGeo = new THREE.CircleGeometry(0.25, 32);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });

    teleportMarker = new THREE.Mesh(markerGeo, markerMat);
    teleportMarker.rotation.x = -Math.PI / 2;
    teleportMarker.visible = false;
    scene.add(teleportMarker);

    // === BUTTON EVENTS ===
    controller.addEventListener('selectstart', onSelectStart);
    controller.addEventListener('selectend', onSelectEnd);
}

function onSelectStart() {
    this.userData.isSelecting = true;
}

function onSelectEnd() {
    this.userData.isSelecting = false;

    if (teleportMarker.visible) {
        const offset = new THREE.Vector3();
        offset.copy(teleportMarker.position);

        // Kamera verschieben (Teleport)
        this.parent.position.set(
            -offset.x,
            this.parent.position.y,
            -offset.z
        );
    }
}

export function updateTeleport() {

    if (!controller) return;

    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObject(floor);

    if (intersects.length > 0) {
        const point = intersects[0].point;

        teleportMarker.position.copy(point);
        teleportMarker.visible = true;

        // Laser anpassen
        const ray = controller.getObjectByName('ray');
        ray.scale.z = intersects[0].distance;
    } else {
        teleportMarker.visible = false;
    }
}
