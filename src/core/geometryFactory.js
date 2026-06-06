import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ✅ Maßstab (1 Einheit = 0.5 Meter)
const SCALE = 0.5;

// ✅ globaler Zähler für Punktnamen
let pointIndex = 0;

// ✅ Achsen-Mapping (Mathe → Three.js)
// Mathe-System:
// (x, y, z) = (vorne, rechts, oben)
//
// Three.js:
// (x, y, z) = (rechts, oben, vorne)
//
// 👉 Mapping:
// x (vorne)  → Z
// y (rechts) → X
// z (oben)   → Y
export function mapAxes(x, y, z) {
  return new THREE.Vector3(
    y * SCALE, // → X
    z * SCALE, // → Y
    x * SCALE  // → Z
  );
}

function getNextLabel() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let label = '';
  let i = pointIndex;

  do {
    label = alphabet[i % 26] + label;
    i = Math.floor(i / 26) - 1;
  } while (i >= 0);

  pointIndex++;
  return label;
}

function createTextSprite(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 256;
  canvas.height = 128;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.5, 0.25, 1);

  return sprite;
}

export function createPoint(scene, x, y, z, color = 0xff0000, radius = 0.05) {
  const geo = new THREE.SphereGeometry(radius, 16, 16);
  const mat = new THREE.MeshBasicMaterial({ color });
  const point = new THREE.Mesh(geo, mat);

  // ✅ korrektes Mapping anwenden
  const pos = mapAxes(x, y, z);
  point.position.copy(pos);

  // ✅ Label erzeugen
  const label = getNextLabel();
  const sprite = createTextSprite(label);

  sprite.position.set(0, 0.15, 0);
  point.add(sprite);

  point.userData.label = label;

  scene.add(point);

  return point;
}

export function createLine(scene, points, color = 0x00ffcc) {
  // ✅ Mapping auf alle Punkte anwenden
  const mappedPoints = points.map(p => mapAxes(p.x, p.y, p.z));

  const geo = new THREE.BufferGeometry().setFromPoints(mappedPoints);
  const mat = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geo, mat);

  scene.add(line);
  return line;
}
