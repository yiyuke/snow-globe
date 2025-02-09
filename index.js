// Import THREE.js and required loaders
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Get canvas element
const canvas = document.querySelector("#canvas");

// Create renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(800, 800); // Fixed size

// Create camera
const camera = new THREE.PerspectiveCamera(
  45,
  1, // Aspect ratio is 1 since width = height
  0.1,
  1000
);
camera.position.z = 10;

function resizeRendererToDisplaySize(renderer) {
  return false; // Disable auto-resizing since we want fixed size
}

export function main() {
  // ... existing code for renderer setup ...

  // Create new scene
  const scene = new THREE.Scene();

  // Create a group for models and snow
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  // Add snow particles
  const snow = [];
  const flakeGeometry = new THREE.SphereGeometry(0.02, 4, 3);
  const flakeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

  for (let i = 0; i < 100; i++) {
    const mesh = new THREE.Mesh(flakeGeometry, flakeMaterial);
    const radius = 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    mesh.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      Math.random() * 4 - 2,
      radius * Math.sin(phi) * Math.sin(theta)
    );

    snow.push(mesh);
    modelGroup.add(mesh);
  }

  // Add glass sphere
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 32, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.4,
      transparent: true,
      opacity: 0.5,
    })
  );
  scene.add(sphere);

  // Add platform
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.4, 0.15, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.2,
      transmission: 0.6,
      thickness: 0.8,
    })
  );
  platform.position.y = -2.4;
  scene.add(platform);

  // Load your model
  const loader = new GLTFLoader();
  loader.load("./aspasia/scene.gltf", (gltf) => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.colorSpace = THREE.LinearSRGBColorSpace;
      }
    });

    // Calculate the center of the model
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Create a pivot point at the center
    const pivot = new THREE.Group();
    scene.add(pivot);
    pivot.position.y = -2.4; // Adjusted height to sit on platform

    // Center the model on the pivot
    gltf.scene.position.x -= center.x;
    gltf.scene.position.z -= center.z;
    gltf.scene.position.y -= center.y - size.y / 2; // Adjust Y position based on model height

    gltf.scene.scale.set(1.7, 1.7, 1.7);
    pivot.add(gltf.scene);
    modelGroup.add(pivot);
  });

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, Math.PI);
  scene.add(ambientLight);

  // Main render loop
  function render() {
    // Handle resize
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // Animate snow
    snow.forEach((flake) => {
      flake.position.y -= 0.01;
      if (flake.position.y < -2) {
        flake.position.y = 2;
        const radius = 2 * Math.sqrt(Math.random());
        const theta = Math.random() * Math.PI * 2;
        flake.position.x = radius * Math.cos(theta);
        flake.position.z = radius * Math.sin(theta);
      }
    });

    // Rotate model group
    modelGroup.rotation.y += 0.0025;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
