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
let controllers; // ✅ wichtig für später

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

  // ✅ Achsen
  const axes = new THREE.AxesHelper(5);
  scene.add(axes);

  // ✅ Controller
  controllers = initControllers(renderer, rig);

  // ✅ Vector UI (vor Input initialisieren → sauberer)
  initVectorUI(scene);

  // ✅ UI an rechten Controller
  initInputUI(scene, camera, rig, controllers.right, {
    onCreatePoint: (x, y, z) => {
      const p = createPoint(scene, x, y, z, 0xff0000, 0.05);

      setVectorFromComponents(x, y, z, {
        lineColor: 0x00ffcc,
        pointColor: 0x00ff00
      });

      // ✅ nutzt automatisch A, B, C Labels
      addOrtsvektorForPoint(p, x, y, z);
    }
  });

  // ✅ Teleport nutzt Rig
  initTeleport(renderer, scene, rig);
}

function animate() {
  renderer.setAnimationLoop(() => {
    updateControllers();
    updateTeleport();

    // ✅ 🔥 Controller-Buttons (A / X Toggle)
    if (controllers?.left) handleControllerButtons(controllers.left);
    if (controllers?.right) handleControllerButtons(controllers.right);

    renderer.render(scene, camera);
  });
}
