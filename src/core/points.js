import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene;

export function initPoints(s) {
    scene = s;
}

export function createPoint(x, y, z) {

    // Kugel
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffff00 })
    );
    sphere.position.set(x, y, z);
    scene.add(sphere);

    // Text (Canvas)
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.fillText(`(${x}/${y}/${z})`, 10, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const label = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: texture })
    );
    label.position.set(x, y + 0.4, z);
    label.scale.set(1.5, 0.75, 1);

    scene.add(label);
}
