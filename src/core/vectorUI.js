import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { createLine, createPoint } from './geometryFactory.js';

let scene;

let vectorGroup = null;
let spriteRoot = null;

let labelSprites = {};

export function initVectorUI(s) {
  scene = s;

  vectorGroup = new THREE.Group();
  scene.add(vectorGroup);

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

  // Alte Geometrie/Material sauber entfernen
  while (vectorGroup.children.length) {
    const child = vectorGroup.children[0];
    vectorGroup.remove(child);

    // dispose nur wenn vorhanden
    if (child.geometry) child.geometry.dispose?.();
    if (child.material) {
      // material kann Array sein
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

  const start = new THREE.Vector3(0, 0, 0);
  const end = new THREE.Vector3(x, y, z);

  // Vektor Linie
  createLine(vectorGroup, [start, end], opts.lineColor ?? 0x00ffcc);

  // Endpunkt
  createPoint(
    vectorGroup,
    end.x,
    end.y,
    end.z,
    opts.pointColor ?? 0x00ff00,
    0.06
  );

  // Labels updaten
  updateSprite(labelSprites.vx, `vx: ${x}`);
  updateSprite(labelSprites.vy, `vy: ${y}`);
  updateSprite(labelSprites.vz, `vz: ${z}`);
}

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

  // Wichtig: Texture als neu markieren
  sprite.material.map.needsUpdate = true;
}
