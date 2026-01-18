import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createTextPanel } from "../utils/textPanel.js";
import { createParticleSystem } from "../utils/geometry.js";

// ROOM 1: Thinking Space - How I Think as an Engineer
export function createRoom1(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);

  // Clean, open environment with soft white/blue lighting
  scene.background = new THREE.Color(0xe8f4f8);
  scene.fog = new THREE.Fog(0xe8f4f8, 10, 80);

  // Invisible platform
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      roughness: 0.9,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);
  spellTargets.push(platform);

  // Central glowing cube - "Uncertainty → Clarity"
  const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
  const cubeMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a90e2,
    emissive: 0x2a6ad2,
    emissiveIntensity: 0.8,
    metalness: 0.3,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
  });
  const centralCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  centralCube.position.set(0, 2, -8);
  centralCube.userData.clickable = true;
  centralCube.userData.organized = false;
  group.add(centralCube);
  spellTargets.push(centralCube);

  // Cube label
  const cubeLabel = createTextPanel({
    title: "Uncertainty → Clarity",
    body: ["Click to organize"],
    width: 3,
    height: 1.5,
  });
  cubeLabel.position.set(0, 4.5, -8);
  group.add(cubeLabel);

  // Floating words around the cube
  const floatingWords = [
    { text: "Assumptions", pos: [-4, 3, -6], rotation: Math.PI / 8 },
    { text: "First Principles", pos: [4, 3.5, -6], rotation: -Math.PI / 8 },
    { text: "Simplicity", pos: [-3.5, 2, -10], rotation: Math.PI / 6 },
    { text: "Iteration", pos: [3.5, 2.5, -10], rotation: -Math.PI / 6 },
  ];

  const wordMeshes = [];
  floatingWords.forEach((wordData) => {
    const wordPanel = createTextPanel({
      title: wordData.text,
      body: [],
      width: 2.5,
      height: 0.8,
    });
    wordPanel.position.set(...wordData.pos);
    wordPanel.rotation.y = wordData.rotation;
    wordPanel.userData.originalPos = new THREE.Vector3(...wordData.pos);
    wordPanel.userData.originalRot = wordData.rotation;
    wordPanel.userData.floatOffset = Math.random() * Math.PI * 2;
    group.add(wordPanel);
    wordMeshes.push(wordPanel);
  });

  // Ambient particles (representing thoughts)
  const thoughtParticles = createParticleSystem(150, {
    size: 0.08,
    color: 0x6ab6ee,
    spread: 25,
    emissive: true,
    opacity: 0.5,
    centerPosition: new THREE.Vector3(0, 4, -8),
  });
  group.add(thoughtParticles);

  // Soft ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Point light above cube
  const cubeLight = new THREE.PointLight(0x6ab6ee, 1.5, 20);
  cubeLight.position.set(0, 5, -8);
  scene.add(cubeLight);

  // Directional light
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  // Main description panel
  const descPanel = createTextPanel({
    title: "How I Think as an Engineer",
    body: [
      "Engineering is about transforming uncertainty into clarity.",
      "",
      "I start with assumptions, break them down to first principles,",
      "seek simplicity, and refine through iteration.",
      "",
      "This is my thinking space.",
    ],
    width: 8,
    height: 5,
  });
  descPanel.position.set(0, 3, -16);
  group.add(descPanel);

  rooms.push({
    id: "room1",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, 0),
    update: (time, delta) => {
      // Rotate central cube
      centralCube.rotation.y += delta * 0.5;
      centralCube.rotation.x += delta * 0.3;

      // Pulse cube emissive
      const pulse = 0.8 + Math.sin(time * 2) * 0.3;
      centralCube.material.emissiveIntensity = pulse;

      // If organized, arrange words in structure
      if (centralCube.userData.organized) {
        // Snap words into grid positions around cube
        const targetPositions = [
          [0, 4.5, -8],  // Top
          [0, -0.5, -8], // Bottom
          [-3, 2, -8],   // Left
          [3, 2, -8],    // Right
        ];

        wordMeshes.forEach((word, i) => {
          const target = new THREE.Vector3(...targetPositions[i]);
          word.position.lerp(target, delta * 2);
          word.rotation.y += (0 - word.rotation.y) * delta * 3;
        });
      } else {
        // Float words gently
        wordMeshes.forEach((word) => {
          const originalPos = word.userData.originalPos;
          const floatOffset = word.userData.floatOffset;
          word.position.y = originalPos.y + Math.sin(time + floatOffset) * 0.3;
        });
      }

      // Animate thought particles
      const positions = thoughtParticles.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3] += Math.sin(time + i * 0.1) * 0.01;
        positions.array[i * 3 + 1] += Math.cos(time * 0.5 + i * 0.1) * 0.01;
        positions.array[i * 3 + 2] += Math.sin(time * 0.3 + i * 0.05) * 0.01;
      }
      positions.needsUpdate = true;
    },
  });

  scene.add(group);
  return group;
}
