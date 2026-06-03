import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let controller;
let teleportMarker;
let floor;

let curveLine;
let points = [];
let raycaster = new THREE.Raycaster();

export function initTeleport(renderer, scene, camera) {

    controller = renderer.xr.getController(0);
    scene.add(controller);

    // === PARABEL LINIE ===
    const material = new THREE.LineBasicMaterial({ color: 0x00ffcc });
    const geometry = new THREE.BufferGeometry();

    curveLine = new THREE.Line(geometry, material);
    scene.add(curveLine);

    // === BODEN ===
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x222222 });

    floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // === MARKER ===
    const markerGeo = new THREE.CircleGeometry(0.25, 32);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });

    teleportMarker = new THREE.Mesh(markerGeo, markerMat);
    teleportMarker.rotation.x = -Math.PI / 2;
    teleportMarker.visible = false;
    scene.add(teleportMarker);

    controller.addEventListener('selectstart', () => {
        controller.userData.isSelecting = true;
    });

    controller.addEventListener('selectend', () => {
        controller.userData.isSelecting = false;

        if (teleportMarker.visible) {
            const p = teleportMarker.position;

            controller.parent.position.set(-p.x, controller.parent.position.y, -p.z);
        }
    });
}

export function updateTeleport() {

    if (!controller) return;

    points = [];

    const start = new THREE.Vector3();
    start.setFromMatrixPosition(controller.matrixWorld);

    const direction = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(controller.quaternion)
        .normalize();

    let velocity = direction.multiplyScalar(6); // Stärke der Kurve
    let position = start.clone();

    let hitPoint = null;

    // === PARABEL BERECHNUNG ===
    for (let i = 0; i < 30; i++) {

        points.push(position.clone());

        // Schwerkraft
        velocity.y -= 0.15;

        position = position.clone().add(velocity.clone().multiplyScalar(0.1));

        // Raycast nach unten (prüfen ob Boden getroffen)
        raycaster.set(position, new THREE.Vector3(0, -1, 0));
        const hit = raycaster.intersectObject(floor);

        if (hit.length > 0 && hit[0].distance < 0.2) {
            hitPoint = hit[0].point;
            points.push(hitPoint.clone());
            break;
        }
    }

    // === Linie updaten ===
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    curveLine.geometry.dispose();
    curveLine.geometry = geometry;

    // === Marker ===
    if (hitPoint) {
        teleportMarker.position.copy(hitPoint);
        teleportMarker.visible = true;
    } else {
        teleportMarker.visible = false;
    }
}
