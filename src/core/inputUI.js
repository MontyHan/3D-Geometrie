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
        const newText = makeText(`${axis}: ${values[axis]}`);
        newText.position.copy(textMeshes[axis].position);

        scene.remove(textMeshes[axis]);
        textMeshes[axis].material.map.dispose();
        textMeshes[axis].material.dispose();

        textMeshes[axis] = newText;
        scene.add(newText);
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

// ✅ NEU: Canvas Text (kein TextGeometry mehr!)
function makeText(text) {

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = 256;
    canvas.height = 128;

    context.fillStyle = "white";
    context.font = "40px Arial";
    context.fillText(text, 10, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);

    sprite.scale.set(0.8, 0.4, 1);

    return sprite;
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

// ===== POINT =====

function createPoint(x, y, z) {

    const geo = new THREE.SphereGeometry(0.05);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const point = new THREE.Mesh(geo, mat);

    point.position.set(x, y, z);

    scene.add(point);
}
