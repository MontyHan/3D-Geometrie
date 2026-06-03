// Datei: src/core/teleport.js
// Diese Datei wird in main.js importiert

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function setupTeleport(renderer, scene, camera) {

    const controller = renderer.xr.getController(0);
    scene.add(controller);

    // === Laser ===
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(0,0,-1)
    ]);

    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
    line.scale.z = 5;
    controller.add(line);

    // === Teleport Marker ===
    const marker = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.2, 32),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide })
    );
    marker.rotation.x = -Math.PI / 2;
    marker.visible = false;
    scene.add(marker);

    // === Floor ===
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // === Raycaster ===
    const raycaster = new THREE.Raycaster();
    const tempMatrix = new THREE.Matrix4();

    // === Update Funktion (im Renderloop aufrufen!) ===
    function update() {

        tempMatrix.identity().extractRotation(controller.matrixWorld);

        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        const intersects = raycaster.intersectObject(floor);

        if (intersects.length > 0) {
            const point = intersects[0].point;

            marker.visible = true;
            marker.position.copy(point);

            controller.userData.teleportPoint = point;

        } else {
            marker.visible = false;
            controller.userData.teleportPoint = null;
        }
    }

    // === Teleport bei Trigger ===
    controller.addEventListener('selectstart', () => {

        const point = controller.userData.teleportPoint;
        if (!point) return;

        const xrCamera = renderer.xr.getCamera(camera);

        const currentPosition = new THREE.Vector3();
        currentPosition.setFromMatrixPosition(xrCamera.matrixWorld);

        const offset = new THREE.Vector3().subVectors(point, currentPosition);

        camera.position.add(offset);
    });

    return { update };
}
