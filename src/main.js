import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

import { initXR } from './core/xr.js';
import { initControllers, updateControllers } from './core/controllers.js';
import { initTeleport, updateTeleport } from './core/teleport.js';
import { initGrid } from './core/grid.js';

import { initInputUI } from './core/inputUI.js';
import {
  initVectorUI,
  setVectorFromComponents,
  addOrtsvektorForPoint,
  handleControllerButtons
} from './core/vectorUI.js';

import { createPoint } from './core/geometryFactory.js';

let scene, camera, renderer;
let rig;
let controllers;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202040);

  // ✅ Rig (Spieler)
  rig = new THREE.Group();
  rig.position.set(5, 5, 2);
  scene.add(rig);

  // ✅ Kamera INS Rig
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  rig.add(camera);

  // ✅ Startblick auf Ursprung
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;

  document.body.appendChild(renderer.domElement);

  initXR(renderer);
  initGrid(scene);

  // ✅ Licht
  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  scene.add(light);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(3, 6, 4);
  scene.add(dirLight);

  // ✅ Boden
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // ✅ ✅ ✅ EIGENE ACHSEN (DEIN SYSTEM)

  const axisLength = 5;

  function createAxis(direction, color) {
    const material = new THREE.LineBasicMaterial({ color: color });
    const points = [
      new THREE.Vector3(0, 0, 0),
      direction.clone().multiplyScalar(axisLength)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material);
  }

  // 🔵 X-Achse (BLAU) → entspricht Three.js Z
  const xAxis = createAxis(new THREE.Vector3(0, 0, 1), 0x0000ff);
  scene.add(xAxis);

  // 🔴 Y-Achse (ROT) → entspricht Three.js X
  const yAxis = createAxis(new THREE.Vector3(1, 0, 0), 0xff0000);
  scene.add(yAxis);

  // 🟢 Z-Achse (GRÜN, nach oben) → entspricht Three.js Y
  const zAxis = createAxis(new THREE.Vector3(0, 1, 0), 0x00ff00);
  scene.add(zAxis);

  // ✅ Controller
  controllers = initControllers(renderer, rig);

  // ✅ Vector UI
  initVectorUI(scene);

  // ✅ UI
  initInputUI(scene, camera, rig, controllers.right, {
    onCreatePoint: (x, y, z) => {
      const p = createPoint(scene, x, y, z, 0xff0000, 0.05);

      setVectorFromComponents(x, y, z, {
        lineColor: 0x00ffcc,
        pointColor: 0x00ff00
      });

      addOrtsvektorForPoint(p, x, y, z);
    }
  });

  // ✅ Teleport
  initTeleport(renderer, scene, rig);
}

function animate() {
  renderer.setAnimationLoop(() => {
    updateControllers();
    updateTeleport();

    if (controllers?.left) handleControllerButtons(controllers.left);
    if (controllers?.right) handleControllerButtons(controllers.right);

    renderer.render(scene, camera);
  });
}
