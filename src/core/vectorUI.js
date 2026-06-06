import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { createLine, createPoint, mapAxes } from './geometryFactory.js';

let scene;

let vectorGroup = null;
let spriteRoot = null;

let labelSprites = {};

let ortsvektorGroup = null;

let ortsvektorenVisible = true;
let lastToggleTime = 0;
const TOGGLE_DELAY = 300;

export function initVectorUI(s) {
  scene = s;

  vectorGroup = new THREE.Group();
  scene.add(vectorGroup);

  ortsvektorGroup = new THREE.Group();
  scene.add(ortsvektorGroup);

  spriteRoot = new THREE.Group();
  spriteRoot.position.set(1.2, 1.7, -2);
  scene.add(spriteRoot);

  labelSprites = {
    vx: makeTextSprite('vx: 0'),
    vy: makeTextSprite('vy: 0'),
    vz: makeTextSprite('vz: 0'),
  };

  labelSprites.vx.position.set(0, 0.15, 0);
  labelSprites.vy.position.set(0, -0.15, 0);
  labelSprites.vz.position.set(0, -0.45, 0);

  spriteRoot.add(labelSprites.vx, labelSprites.vy, labelSprites.vz);
}

export function setVectorFromComponents(x, y, z, opts = {}) {
  if (!scene || !vectorGroup) return;

  // ✅ cleanup
  while (vectorGroup.children.length) {
    const child = vectorGroup.children[0];
    vectorGroup.remove(child);

    if (child.geometry) child.geometry.dispose?.();
    if (child.material) {
      if (Array.isArray(child.material)) {
        for (const m of child.material) {
          m.map?.dispose?.();
          m.dispose?.();
        }
      } else {
        child.material.map?.dispose?.();
        child.material.dispose?.();
      }
    }
  }

  // ✅ WICHTIG: createLine nutzt Mapping intern
  createLine(vectorGroup, [
    { x: 0, y: 0, z: 0 },
    { x, y, z }
  ], opts.lineColor ?? 0x00ffcc);

  createPoint(
    vectorGroup,
    x,
    y,
    z,
    opts.pointColor ?? 0x00ff00,
    0.06
  );

  updateSprite(labelSprites.vx, `vx: ${x}`);
  updateSprite(labelSprites.vy, `vy: ${y}`);
  updateSprite(labelSprites.vz, `vz: ${z}`);
}

//
// ✅ Ortsvektor (FIXED)
//
export function addOrtsvektorForPoint(point, x, y, z) {
  if (!ortsvektorGroup) return;

  const group = new THREE.Group();

  // ✅ Mapping anwenden
  const start = new THREE.Vector3(0, 0, 0);
  const end = mapAxes(x, y, z);

  // ✅ Linie
 
