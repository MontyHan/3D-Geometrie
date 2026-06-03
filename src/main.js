import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { initXR } from './core/xr.js';
import { initControllers, updateControllers } from './core/controllers.js';
import { initTeleport, updateTeleport } from './core/teleport.js';
import { initGrid } from './core/grid.js';

let scene, camera, renderer;
let rig; // ✅ NEU

init();
animate();

function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202040);

    // ✅ NEU: Rig (Spieler)
    rig = new THREE.Group();
    scene.add(rig);

    // ✅ Kamera ins Rig
    camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 100);
    rig.add(camera);

    renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    document.body.appendChild(renderer.domElement);

    initXR(renderer);
    initGrid(scene);

    // Licht
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(3,6,4);
    scene.add(dirLight);

    // Boden
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(40,40),
        new THREE.MeshStandardMaterial({ color:0x222222 })
    );
    floor.rotation.x = -Math.PI/2;
    scene.add(floor);

    // Koordinatensystem
    const axes = new THREE.AxesHelper(5);
    scene.add(axes);

    // ✅ Systeme angepasst
    initControllers(renderer, rig);      // statt scene
    initTeleport(renderer, scene, rig);  // statt camera
}

function animate() {
    renderer.setAnimationLoop(() => {

        updateControllers();
        updateTeleport();

        renderer.render(scene, camera);
    });
}
