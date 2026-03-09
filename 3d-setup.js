import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. SCENE SETUP
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

// Default camera framing for your 3D environment
camera.position.set(1.8, -1.5, 8); 

const webglRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
webglRenderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('webgl-container').appendChild(webglRenderer.domElement);

const controls = new OrbitControls(camera, webglRenderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false; // Prevents scroll hijacking
controls.target.set(0, 0, 0); 

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

// 2. LOAD 3D MODEL
const loader = new GLTFLoader();
loader.load('computers.glb', (gltf) => {
    const model = gltf.scene;
    // Lower the entire desk object so it aligns cleanly
    model.position.set(0, -2.5, 0); 
    scene.add(model);
});

// 3. RENDER LOOP
function animate() {
    requestAnimationFrame(animate);
    controls.update(); 
    webglRenderer.render(scene, camera);
}
animate();