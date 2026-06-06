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
  if (!ortsvektorGroup || !point) return;

  const group = new THREE.Group();

  const start = new THREE.Vector3(0, 0, 0);

  // ✅ Position DIREKT vom Punkt übernehmen (kein mapAxes mehr!)
  const end = point.position.clone();

  // ✅ Linie
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = new THREE.LineBasicMaterial({ color: 0x00ffcc });
  const line = new THREE.Line(geometry, material);
  group.add(line);

  // ✅ Pfeil
  const dir = end.clone().normalize();
  const length = end.length();

  const arrow = new THREE.ArrowHelper(
    dir,
    start,
    length,
    0x00ffcc,
    0.2,
    0.1
  );
  group.add(arrow);

  // ✅ Label
  const name = point.userData.label ?? '';
  const sprite = makeTextSprite(`r${name} = (${x}/${y}/${z})`);

  const labelPos = end.clone().add(new THREE.Vector3(0.2, 0.2, 0.2));
  sprite.position.copy(labelPos);

  group.add(sprite);

  ortsvektorGroup.add(group);

  point.userData.ortsvektor = group;
}

export function toggleOrtsvektoren(visible) {
  if (!ortsvektorGroup) return;
  ortsvektorGroup.visible = visible;
}

export function handleControllerButtons(controller) {
  if (!controller || !controller.gamepad) return;

  const now = performance.now();
  if (now - lastToggleTime < TOGGLE_DELAY) return;

  const buttons = controller.gamepad.buttons;

  if (buttons[4]?.pressed) {
    ortsvektorenVisible = !ortsvektorenVisible;
    toggleOrtsvektoren(ortsvektorenVisible);

    lastToggleTime = now;

    console.log(
      `Ortsvektoren: ${ortsvektorenVisible ? 'AN' : 'AUS'}`
    );
  }
}

//
// 🔧 Helper
//
function makeTextSprite(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 512;
  canvas.height = 256;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.font = 'bold 46px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 20, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.95, 0.36, 1);

  return sprite;
}

function updateSprite(sprite, text) {
  if (!sprite?.material?.map?.image) return;

  const canvas = sprite.material.map.image;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.font = 'bold 46px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 20, canvas.height / 2);

  sprite.material.map.needsUpdate = true;
}
