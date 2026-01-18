import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createProceduralTexture } from "../utils/textures.js";
import { createParticleSystem } from "../utils/geometry.js";
import { createTextPanel } from "../utils/textPanel.js";

// ROOM 1: Storm Cloud - Defiance, ego, human ambition
export function createRoom1(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);

  // Storm cloud background
  scene.background = new THREE.Color(0x1a1a2e);
  scene.fog = new THREE.FogExp2(0x1a1a2e, 0.02);

  // Concrete platform with texture
  const concreteTexture = createProceduralTexture('concrete', { width: 1024, height: 1024 });
  concreteTexture.repeat.set(20, 20);
  const platformMaterial = new THREE.MeshStandardMaterial({
    map: concreteTexture,
    roughness: 0.9,
    metalness: 0.1,
  });
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    platformMaterial
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.set(0, 0, 0);
  group.add(platform);
  spellTargets.push(platform);

  // Massive unfinished bridge structures (bridges to nowhere)
  const bridgeMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    roughness: 0.8,
    metalness: 0.3,
  });

  // Create 4 incomplete bridges radiating outward
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const distance = 25;

    // Bridge deck (incomplete, broken off)
    const deckLength = 15 + Math.random() * 10;
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.5, deckLength),
      bridgeMaterial
    );
    deck.position.set(
      Math.cos(angle) * distance,
      1,
      Math.sin(angle) * distance
    );
    deck.rotation.y = angle;
    group.add(deck);
    spellTargets.push(deck);

    // Support beams (incomplete, broken)
    for (let j = 0; j < 3; j++) {
      const beamHeight = 3 + Math.random() * 4;
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, beamHeight, 0.4),
        bridgeMaterial
      );
      beam.position.set(
        Math.cos(angle) * (distance + j * 2 - 2),
        beamHeight / 2,
        Math.sin(angle) * (distance + j * 2 - 2)
      );
      beam.rotation.y = angle;
      beam.rotation.x = (Math.random() - 0.5) * 0.2; // Slight tilt for broken effect
      group.add(beam);
      spellTargets.push(beam);
    }
  }

  // Machines without purpose (broken mechanical structures)
  for (let i = 0; i < 6; i++) {
    const machineGroup = new THREE.Group();
    const angle = (i / 6) * Math.PI * 2;
    const distance = 35 + Math.random() * 15;

    // Base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 2, 1, 8),
      new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.7,
        metalness: 0.5,
      })
    );
    machineGroup.add(base);

    // Vertical shaft (broken/incomplete)
    const shaftHeight = 3 + Math.random() * 4;
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, shaftHeight, 8),
      bridgeMaterial
    );
    shaft.position.y = shaftHeight / 2 + 0.5;
    machineGroup.add(shaft);

    // Random machine parts
    const parts = Math.floor(Math.random() * 3) + 2;
    for (let p = 0; p < parts; p++) {
      const part = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.5 + Math.random() * 1,
          0.5 + Math.random() * 1,
          0.5 + Math.random() * 1
        ),
        bridgeMaterial
      );
      part.position.set(
        (Math.random() - 0.5) * 2,
        1 + Math.random() * shaftHeight,
        (Math.random() - 0.5) * 2
      );
      part.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      machineGroup.add(part);
    }

    machineGroup.position.set(
      Math.cos(angle) * distance,
      0,
      Math.sin(angle) * distance
    );
    machineGroup.rotation.y = Math.random() * Math.PI * 2;
    group.add(machineGroup);
  }

  // Storm cloud particles (volumetric effect)
  const stormClouds = createParticleSystem(300, {
    size: 4,
    color: 0x2a2a4a,
    spread: 100,
    emissive: false,
    opacity: 0.6,
    centerPosition: new THREE.Vector3(0, 15, 0)
  });
  group.add(stormClouds);

  // Wind particles (horizontal streaks)
  const windParticles = createParticleSystem(200, {
    size: 0.3,
    color: 0x7be4ff,
    spread: 80,
    emissive: true,
    opacity: 0.4,
    centerPosition: new THREE.Vector3(0, 5, 0)
  });
  group.add(windParticles);

  // Lightning flashes (enhanced)
  const lightningLights = [];
  for (let i = 0; i < 8; i++) {
    const light = new THREE.PointLight(0x7be4ff, 0, 60);
    light.position.set(
      (Math.random() - 0.5) * 120,
      20 + Math.random() * 40,
      (Math.random() - 0.5) * 120
    );
    scene.add(light);
    lightningLights.push({
      light,
      time: Math.random() * 10,
      flashTimer: 0
    });
  }

  // Cracked mirror with fragments
  const mirrorGroup = new THREE.Group();
  const crackTexture = createProceduralTexture('mirror-crack', { width: 512, height: 512 });

  // Main mirror piece
  const mirror = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 4),
    new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.1,
      metalness: 0.9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    })
  );
  mirrorGroup.add(mirror);

  // Crack overlay
  const crackOverlay = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 4),
    new THREE.MeshBasicMaterial({
      map: crackTexture,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    })
  );
  crackOverlay.position.z = 0.01; // Slightly in front
  mirrorGroup.add(crackOverlay);

  // Broken fragments floating around mirror
  for (let i = 0; i < 8; i++) {
    const fragmentSize = 0.3 + Math.random() * 0.5;
    const fragment = new THREE.Mesh(
      new THREE.PlaneGeometry(fragmentSize, fragmentSize),
      new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.1,
        metalness: 0.9,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      })
    );
    fragment.position.set(
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 2
    );
    fragment.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    fragment.userData.rotationSpeed = (Math.random() - 0.5) * 0.5;
    fragment.userData.floatOffset = Math.random() * Math.PI * 2;
    mirrorGroup.add(fragment);
  }

  mirrorGroup.position.set(10, 2.5, -5);
  mirrorGroup.rotation.y = -Math.PI / 6;
  group.add(mirrorGroup);

  // Text panels
  const panel1 = createTextPanel({
    title: "Who I Am & How I See Engineering Design",
    body: [
      "I see the engineering design process as the epitome of human ego.",
      "It is the strong defiance against the world, the desire to show that we are capable of something greater.",
      "It is the human instinct to do something unique, to be the best at something, even though we are destined to die.",
      "",
      "When I look at engineered objects, I don't just see products.",
      "I imagine the person behind them — the ideas they had, the failures they faced, and the long, iterative process it took to bring that idea into reality.",
      "",
      "To me, engineering design is a declaration of defiance.",
      "A way to prove to yourself that your dreams can exist in the real world.",
    ],
    width: 8,
    height: 6,
  });
  panel1.position.set(0, 3, -12);
  group.add(panel1);

  // Ambient storm lighting
  const ambientLight = new THREE.AmbientLight(0x2a2a4a, 0.2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0x7be4ff, 0.4);
  directionalLight.position.set(10, 30, 10);
  scene.add(directionalLight);

  rooms.push({
    id: "room1",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, 0),
    update: (time, delta) => {
      // Lightning flashes with more dramatic effect
      lightningLights.forEach((data) => {
        data.flashTimer -= delta;
        if (data.flashTimer <= 0 && Math.random() < 0.02) {
          // Start flash
          data.light.intensity = 4 + Math.random() * 6;
          data.flashTimer = 0.1 + Math.random() * 0.2;
          // Brief camera shake effect could be added here
        } else {
          data.light.intensity *= 0.85;
        }
      });

      // Animate storm clouds (slow drift)
      const positions = stormClouds.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3] += Math.sin(time + i) * 0.01;
        positions.array[i * 3 + 1] += Math.cos(time * 0.5 + i) * 0.008;
        positions.array[i * 3 + 2] += Math.sin(time * 0.7 + i * 0.1) * 0.01;
      }
      positions.needsUpdate = true;

      // Animate wind particles (horizontal movement)
      const windPositions = windParticles.geometry.attributes.position;
      for (let i = 0; i < windPositions.count; i++) {
        windPositions.array[i * 3] += delta * 8; // Move right
        // Wrap around
        if (windPositions.array[i * 3] > 40) {
          windPositions.array[i * 3] = -40;
        }
      }
      windPositions.needsUpdate = true;

      // Animate mirror fragments
      mirrorGroup.children.forEach((child, idx) => {
        if (idx > 1 && child.userData.rotationSpeed) { // Skip main mirror and crack overlay
          child.rotation.y += child.userData.rotationSpeed * delta;
          child.rotation.x += child.userData.rotationSpeed * delta * 0.5;
          child.position.y += Math.sin(time * 2 + child.userData.floatOffset) * 0.01;
        }
      });

      // Subtle platform trembling (simulated by adjusting fog density)
      scene.fog.density = 0.02 + Math.sin(time * 3) * 0.002;
    },
  });

  scene.add(group);
  return group;
}
