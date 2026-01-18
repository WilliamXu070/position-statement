import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EYE_HEIGHT } from "../constants.js";

// ROOM 3: Microscope View - Click to See Plankton
export function createRoom3(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -400);

  // Clean lab environment
  scene.background = new THREE.Color(0xf5f5f5);
  scene.fog = new THREE.Fog(0xf5f5f5, 10, 60);

  // White lab floor
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.2,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);
  spellTargets.push(platform);

  // === PEDESTAL ===

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1, 1.5, 16),
    new THREE.MeshStandardMaterial({
      color: 0x8a8a8a,
      roughness: 0.4,
      metalness: 0.3,
    })
  );
  pedestal.position.set(0, 0.75, -8);
  group.add(pedestal);
  spellTargets.push(pedestal);

  // Pedestal top platform
  const pedestalTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 0.1, 16),
    new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      roughness: 0.3,
      metalness: 0.4,
    })
  );
  pedestalTop.position.set(0, 1.55, -8);
  group.add(pedestalTop);

  // === MICROSCOPE ON PEDESTAL ===

  const loader = new GLTFLoader();
  loader.load(
    'models/microscope.gltf',
    (gltf) => {
      const microscope = gltf.scene;
      microscope.position.set(0, 1.6, -8);
      microscope.scale.set(50, 50, 50);
      microscope.rotation.y = 0;
      group.add(microscope);

      microscope.traverse((child) => {
        if (child.isMesh) {
          spellTargets.push(child);
        }
      });

      console.log('✅ Loaded microscope on pedestal');
    },
    (progress) => {
      console.log('Loading microscope:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
    },
    (error) => {
      console.error('❌ Error loading microscope:', error);
    }
  );

  // === CLICKABLE BUTTON ABOVE MICROSCOPE ===

  const buttonGroup = new THREE.Group();

  // Button base (clickable)
  const button = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32),
    new THREE.MeshStandardMaterial({
      color: 0xff4444,
      emissive: 0xff0000,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.5,
    })
  );
  button.position.y = 0;
  button.userData.clickable = true;
  button.userData.isViewButton = true; // Mark as the view button
  buttonGroup.add(button);
  spellTargets.push(button);

  // Button label
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('VIEW', canvas.width / 2, canvas.height / 2);

  const labelTexture = new THREE.CanvasTexture(canvas);
  const labelMaterial = new THREE.MeshBasicMaterial({
    map: labelTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.125),
    labelMaterial
  );
  label.position.y = 0.15;
  buttonGroup.add(label);

  buttonGroup.position.set(0, 4, -8);
  group.add(buttonGroup);

  // === LIGHTING ===

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
  mainLight.position.set(5, 10, 5);
  scene.add(mainLight);

  const fillLight = new THREE.PointLight(0xffffff, 0.6, 30);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);

  // Spotlight on microscope
  const microscopeSpot = new THREE.SpotLight(0xffffff, 1, 15, Math.PI / 6);
  microscopeSpot.position.set(0, 6, -8);
  microscopeSpot.target.position.set(0, 1.6, -8);
  scene.add(microscopeSpot);
  scene.add(microscopeSpot.target);

  rooms.push({
    id: "room3",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -400),
    update: (time, delta) => {
      // Pulse button
      button.material.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.2;
    },
  });

  scene.add(group);
  return group;
}
