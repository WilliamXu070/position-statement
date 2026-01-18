import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createTextPanel } from "../utils/textPanel.js";

// ROOM 3: First Principles - CellScope (Lab/Workshop Split)
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

  // Dividing line (half lab / half workshop)
  const dividerLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 30),
    new THREE.MeshStandardMaterial({
      color: 0x4a90e2,
      emissive: 0x2a6ad2,
      emissiveIntensity: 0.5,
    })
  );
  dividerLine.position.set(0, 0.05, -5);
  group.add(dividerLine);

  // === LEFT SIDE: Physics/Theory ===

  // Simple lens visualization
  const lensMaterial = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.9,
  });
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32),
    lensMaterial
  );
  lens.rotation.z = Math.PI / 2;
  lens.position.set(-6, 2, -5);
  group.add(lens);

  // Light ray diagrams (simple lines)
  const lightRayMaterial = new THREE.LineBasicMaterial({
    color: 0xffaa00,
    linewidth: 2,
  });

  // Create light rays passing through lens
  for (let i = 0; i < 5; i++) {
    const yOffset = -1 + (i * 0.5);
    const points = [
      new THREE.Vector3(-10, 2 + yOffset, -5),
      new THREE.Vector3(-6, 2 + yOffset, -5),
      new THREE.Vector3(-2, 2 - yOffset * 0.3, -5),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lightRayMaterial);
    group.add(line);
  }

  // Physics label
  const physicsLabel = createTextPanel({
    title: "Light Optics",
    body: ["Understanding the fundamentals"],
    width: 3,
    height: 1.5,
  });
  physicsLabel.position.set(-6, 4, -5);
  group.add(physicsLabel);

  // === RIGHT SIDE: Workshop/Application ===

  // Placeholder for microscope model
  const phoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.3,
    metalness: 0.7,
  });
  const phone = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.6, 0.15),
    phoneMaterial
  );
  phone.position.set(6, 1.5, -5);
  group.add(phone);

  // Microscope lens attachment
  const microscopeLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16),
    new THREE.MeshStandardMaterial({
      color: 0x6a6a6a,
      roughness: 0.4,
      metalness: 0.8,
    })
  );
  microscopeLens.position.set(6, 0.5, -4.8);
  group.add(microscopeLens);

  // Small stand
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.7, 0.3, 16),
    new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.6,
    })
  );
  stand.position.set(6, 0.15, -5);
  group.add(stand);

  // Workshop label
  const workshopLabel = createTextPanel({
    title: "CellScope Build",
    body: ["First principles → prototype"],
    width: 3,
    height: 1.5,
  });
  workshopLabel.position.set(6, 4, -5);
  group.add(workshopLabel);

  // CAD blueprint on back wall
  const blueprintPanel = createTextPanel({
    title: "Design Evolution",
    body: [
      "1. Light path physics",
      "2. Lens configuration",
      "3. Phone integration",
      "4. Prototype testing",
    ],
    width: 6,
    height: 4,
  });
  blueprintPanel.position.set(0, 3, -15);
  blueprintPanel.material.color = new THREE.Color(0x0a3a6a);
  group.add(blueprintPanel);
  blueprintPanel.userData.clickable = true;
  blueprintPanel.userData.animated = false;
  spellTargets.push(blueprintPanel);

  // Main description panel
  const descPanel = createTextPanel({
    title: "First Principles: CellScope",
    body: [
      "I didn't start by copying existing microscope designs.",
      "",
      "I started with physics — how light bends through lenses.",
      "",
      "From those fundamentals, I built upward.",
    ],
    width: 9,
    height: 4.5,
  });
  descPanel.position.set(0, 3, 5);
  group.add(descPanel);

  // Bright lab lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const labLight1 = new THREE.PointLight(0xffffff, 1, 25);
  labLight1.position.set(-8, 6, -5);
  scene.add(labLight1);

  const labLight2 = new THREE.PointLight(0xffffff, 1, 25);
  labLight2.position.set(8, 6, -5);
  scene.add(labLight2);

  rooms.push({
    id: "room3",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -400),
    update: (time, delta) => {
      lens.rotation.x += delta * 0.5;
      const pulse = 1 + Math.sin(time * 2) * 0.05;
      microscopeLens.scale.set(pulse, pulse, pulse);

      if (blueprintPanel.userData.animated) {
        blueprintPanel.material.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.2;
      }

      group.traverse((child) => {
        if (child instanceof THREE.Line) {
          child.material.opacity = 0.6 + Math.sin(time * 2) * 0.3;
          child.material.transparent = true;
        }
      });
    },
  });

  scene.add(group);
  return group;
}
