import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createTextPanel } from "../utils/textPanel.js";

// ROOM 4: Simplicity Over Complexity
export function createRoom4(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -600);

  // Dark room with messy code aesthetic
  scene.background = new THREE.Color(0x0a0a0a);
  scene.fog = new THREE.Fog(0x0a0a0a, 5, 50);

  // Dark floor
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 1.0,
      metalness: 0.0,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);
  spellTargets.push(platform);

  // Messy glowing code blocks scattered around
  const codeBlocks = [];
  const codeColors = [0x00ff88, 0xff4444, 0x4488ff, 0xffaa00, 0xff00ff, 0x00ffff];
  const codeSnippets = [
    "if (complexity > simple)\n  refactor();",
    "while (messy) {\n  simplify();\n}",
    "for (let i=0; i<1000; i++)",
    "try {\n  overcomplicate();\n} catch(e) {}",
    "function doEverything() {\n  // 500 lines...\n}",
    "import * from '*';\nimport everything;",
  ];

  for (let i = 0; i < 12; i++) {
    const color = codeColors[i % codeColors.length];
    const snippet = codeSnippets[i % codeSnippets.length];

    const codeBlock = createTextPanel({
      title: snippet.split('\n')[0],
      body: snippet.split('\n').slice(1),
      width: 2.5,
      height: 2,
    });

    const angle = (i / 12) * Math.PI * 2;
    const radius = 8 + Math.random() * 3;
    const x = Math.cos(angle) * radius;
    const z = -5 + Math.sin(angle) * radius;
    const y = 1.5 + Math.random() * 2;

    codeBlock.position.set(x, y, z);
    codeBlock.rotation.y = -angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    codeBlock.rotation.x = (Math.random() - 0.5) * 0.3;
    codeBlock.rotation.z = (Math.random() - 0.5) * 0.3;

    codeBlock.material = new THREE.MeshStandardMaterial({
      map: codeBlock.material.map,
      emissive: color,
      emissiveIntensity: 0.8,
      color: 0x1a1a1a,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });

    codeBlock.userData.originalPos = codeBlock.position.clone();
    codeBlock.userData.originalRot = new THREE.Euler().copy(codeBlock.rotation);
    codeBlock.userData.floatOffset = Math.random() * Math.PI * 2;

    group.add(codeBlock);
    codeBlocks.push(codeBlock);
    spellTargets.push(codeBlock);
  }

  // Tangled wires connecting code blocks
  const wireMaterial = new THREE.LineBasicMaterial({
    color: 0x444444,
    linewidth: 1,
  });

  const wires = [];
  for (let i = 0; i < 20; i++) {
    const start = codeBlocks[Math.floor(Math.random() * codeBlocks.length)];
    const end = codeBlocks[Math.floor(Math.random() * codeBlocks.length)];

    if (start !== end) {
      const points = [
        start.position.clone(),
        new THREE.Vector3(
          (start.position.x + end.position.x) / 2 + (Math.random() - 0.5) * 2,
          (start.position.y + end.position.y) / 2 + Math.random() * 2,
          (start.position.z + end.position.z) / 2 + (Math.random() - 0.5) * 2
        ),
        end.position.clone(),
      ];

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.03, 8, false);
      const tubeMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        emissive: 0x222222,
        emissiveIntensity: 0.2,
        roughness: 0.8,
      });
      const wire = new THREE.Mesh(tubeGeometry, tubeMaterial);
      group.add(wire);
      wires.push(wire);
    }
  }

  // Clean, minimal door in the center (behind the chaos)
  const doorGeometry = new THREE.PlaneGeometry(2, 3.5);
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.0,
    roughness: 0.2,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 1.75, -15);
  door.userData.clickable = true;
  door.userData.collapsed = false;
  door.visible = false; // Hidden initially behind code blocks
  group.add(door);
  spellTargets.push(door);

  // Door frame
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.4,
  });
  const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4, 0.2), frameMaterial);
  frameLeft.position.set(-1.05, 2, -15);
  frameLeft.visible = false;
  group.add(frameLeft);

  const frameRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4, 0.2), frameMaterial);
  frameRight.position.set(1.05, 2, -15);
  frameRight.visible = false;
  group.add(frameRight);

  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 0.2), frameMaterial);
  frameTop.position.set(0, 4, -15);
  frameTop.visible = false;
  group.add(frameTop);

  // Main description panel
  const descPanel = createTextPanel({
    title: "Simplicity Over Complexity",
    body: [
      "Complexity is seductive. It feels comprehensive.",
      "",
      "But simplicity is harder — and more powerful.",
      "",
      "Click any code block to collapse the chaos.",
    ],
    width: 9,
    height: 4.5,
  });
  descPanel.position.set(0, 3.5, 8);
  group.add(descPanel);

  // Dim ambient light
  const ambientLight = new THREE.AmbientLight(0x1a1a1a, 0.3);
  scene.add(ambientLight);

  // Point lights from code blocks
  const codeLights = [];
  codeBlocks.forEach((block) => {
    const light = new THREE.PointLight(block.material.emissive, 0.5, 5);
    light.position.copy(block.position);
    scene.add(light);
    codeLights.push(light);
  });

  // Door light (initially off)
  const doorLight = new THREE.PointLight(0xffffff, 0, 15);
  doorLight.position.set(0, 2, -13);
  scene.add(doorLight);

  rooms.push({
    id: "room4",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -600),
    update: (time, delta) => {
      // If clicked, collapse complexity into simplicity
      if (door.userData.collapsed) {
        // Move code blocks off to sides and fade
        codeBlocks.forEach((block, i) => {
          const angle = (i / codeBlocks.length) * Math.PI * 2;
          const targetX = Math.cos(angle) * 25;
          const targetZ = -5 + Math.sin(angle) * 25;

          block.position.x += (targetX - block.position.x) * delta * 1.5;
          block.position.z += (targetZ - block.position.z) * delta * 1.5;
          block.material.emissiveIntensity = Math.max(0, block.material.emissiveIntensity - delta * 0.8);

          // Update lights
          codeLights[i].position.copy(block.position);
          codeLights[i].intensity = block.material.emissiveIntensity * 0.5;
        });

        // Fade wires
        wires.forEach((wire) => {
          wire.material.emissiveIntensity = Math.max(0, wire.material.emissiveIntensity - delta * 0.5);
          wire.material.opacity = Math.max(0, wire.material.opacity - delta * 0.5);
          wire.material.transparent = true;
        });

        // Reveal and brighten door
        door.visible = true;
        frameLeft.visible = true;
        frameRight.visible = true;
        frameTop.visible = true;
        doorMaterial.emissiveIntensity = Math.min(0.8, doorMaterial.emissiveIntensity + delta * 0.5);
        doorLight.intensity = Math.min(2, doorLight.intensity + delta * 1.5);

        // Brighten scene
        scene.fog.color.lerp(new THREE.Color(0x2a2a2a), delta * 0.5);
      } else {
        // Float code blocks messily
        codeBlocks.forEach((block) => {
          const floatOffset = block.userData.floatOffset;
          const originalPos = block.userData.originalPos;

          block.position.y = originalPos.y + Math.sin(time + floatOffset) * 0.2;
          block.rotation.y += delta * 0.2;

          // Pulse emissive
          const pulse = 0.8 + Math.sin(time * 2 + floatOffset) * 0.3;
          block.material.emissiveIntensity = pulse;
        });
      }
    },
  });

  scene.add(group);
  return group;
}
