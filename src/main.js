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

// ✅ Mapping (Mathe → Three.js)
// x → vorne, y → rechts, z → oben
function mathToThree(x, y, z) {
  return new THREE.Vector3(y, z, x);
}

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202040);

  // ✅ Rig (Spieler)
  rig = new THREE.Group();
  rig.position.set(0, 1, 3);
  scene.add(rig);

  // ✅ Kamera ins Rig
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  rig.add(camera);
  camera.lookAt(0, 0, 0);

  // ✅ Renderer
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

  // ✅ ACHSEN (Mathe-System)
  const axisLength = 5;

  function createAxis(direction, color) {
    const material = new THREE.LineBasicMaterial({ color });
    const points = [
      new THREE.Vector3(0, 0, 0),
      direction.clone().multiplyScalar(axisLength)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material);
  }

  // 🔵 x → vorne
  scene.add(createAxis(new THREE.Vector3(0, 0, 1), 0x0000ff));

  // 🔴 y → rechts
  scene.add(createAxis(new THREE.Vector3(1, 0, 0), 0xff0000));

  // 🟢 z → oben
  scene.add(createAxis(new THREE.Vector3(0, 1, 0), 0x00ff00));

  // ✅ Controller
  controllers = initControllers(renderer, rig);

  // ✅ UI Systeme
  initVectorUI(scene);
  initInputUI(scene, camera, rig, controllers.right, {
    onCreatePoint: (x, y, z) => {
      const pos = mathToThree(x, y, z);

      // ✅ Punkt (nur einmal gemappt!)
      const p = createPoint(scene, pos.x, pos.y, pos.z, 0xff0000, 0.05);

      // ✅ Ortsvektor korrekt
      addOrtsvektorForPoint(p, x, y, z);

      // optional UI Sync
      setVectorFromComponents(x, y, z, { line: null });
    }
  });
}

function animate() {
  renderer.setAnimationLoop(() => {
    updateControllers(controllers);
    updateTeleport(controllers, rig);

    // ✅ erstmal nur rechter Controller (verhindert Teleport-Konflikt)
    handleControllerButtons(controllers.right);

    renderer.render(scene, camera);
  });
}
