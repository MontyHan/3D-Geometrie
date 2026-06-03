import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, rig;
let controller;

let raycaster = new THREE.Raycaster();
let tempMatrix = new THREE.Matrix4();

let buttons = [];
let values = { x: 0, y: 0, z: 0 };
let textMeshes = {};

export function initInputUI(s, cam, r, ctrl) {
    scene = s;
    camera = cam;
    rig = r;
    controller = ctrl;

    createPanel();
}

function createPanel() {

    const panel = new THREE.Group();
    panel.position.set(0, 1.5, -2);
    scene.add(panel);

    createRow(panel, "x", 0);
    createRow(panel, "y", -0.4);
    createRow(panel, "z", -0.8);

    const createBtn = makeButton("CREATE", 0, -1.4, () => {
        createPoint(values.x, values.y, values.z);
    });

    panel.add(createBtn);
    buttons.push(createBtn);
}

function createRow(panel, axis, y) {

    const text = makeText(`${axis}: 0`);
    text.position.set(-0.6, y, 0);
    panel.add(text);

    textMeshes[axis] = text;

    const plus = makeButton("+", 0.2, y, () => {
        values[axis]++;
        updateText();
    });

    const minus = makeButton("-", 0.5, y, () => {
        values[axis]--;
        updateText();
    });

    panel.add(plus, minus);

    buttons.push(plus, minus);
}

function updateText() {
    for (let axis in textMeshes) {
        textMeshes[axis].geometry.dispose();
        textMeshes[axis].geometry = new THREE.TextGeometry(
            `${axis}: ${values[axis]}`,
            { size: 0.1, height: 0.01 }
        );
    }
}

function makeButton(label, x, y, onClick) {

    const geo = new THREE.BoxGeometry(0.2, 0.2, 0.05);
    const mat = new THREE.MeshBasicMaterial({ color: 0x4444ff });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.set(x, y, 0);

    mesh.userData.onClick = onClick;

    return mesh;
}

function makeText(text) {
    const geo = new THREE.TextGeometry(text, {
        size: 0.1,
        height: 0.01
    });
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    return new THREE.Mesh(geo, mat);
}

// ===== INTERACTION =====

export function handleUISelection() {

    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObjects(buttons);

    if (intersects.length > 0) {
        const obj = intersects[0].object;

        if (obj.userData.onClick) {
            obj.userData.onClick();
        }
    }
}

// ===== POINT (minimal erstmal hier drin) =====

function createPoint(x, y, z) {

    const geo = new THREE.SphereGeometry(0.05);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const point = new THREE.Mesh(geo, mat);

    point.position.set(x, y, z);

    scene.add(point);
}
