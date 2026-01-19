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
    const y = 0.6 + Math.random() * 1.4;

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
    codeBlock.userData.isCodeBlock = true; // Mark as interactable code block

    group.add(codeBlock);
    codeBlocks.push(codeBlock);
    spellTargets.push(codeBlock);
  }

  // Tangled wires connecting code blocks - store connection info for dynamic updates
  const wires = [];
  const wireConnections = [];

  for (let i = 0; i < 20; i++) {
    const startIndex = Math.floor(Math.random() * codeBlocks.length);
    const endIndex = Math.floor(Math.random() * codeBlocks.length);

    if (startIndex !== endIndex) {
      const start = codeBlocks[startIndex];
      const end = codeBlocks[endIndex];

      // Store random offset for mid-point
      const midOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
      );

      const points = [
        start.position.clone(),
        new THREE.Vector3(
          (start.position.x + end.position.x) / 2 + midOffset.x,
          (start.position.y + end.position.y) / 2 + midOffset.y,
          (start.position.z + end.position.z) / 2 + midOffset.z
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
        transparent: true,
        opacity: 1,
      });
      const wire = new THREE.Mesh(tubeGeometry, tubeMaterial);

      // Store connection info for dynamic updates
      wire.userData.startBlockIndex = startIndex;
      wire.userData.endBlockIndex = endIndex;
      wire.userData.midOffset = midOffset;

      group.add(wire);
      wires.push(wire);
      wireConnections.push({ startIndex, endIndex, midOffset, wire });
    }
  }

  // State for animation
  let isOrganized = false;

  // Calculate target positions for organized line
  const lineTargets = [];
  const lineSpacing = 1.8;
  const lineY = 1.6;
  const lineZ = -10;
  const startX = -(codeBlocks.length - 1) * lineSpacing / 2;

  for (let i = 0; i < codeBlocks.length; i++) {
    lineTargets.push({
      position: new THREE.Vector3(startX + i * lineSpacing, lineY, lineZ),
      rotation: new THREE.Euler(0, Math.PI / 2, 0), // Rotate 90° so faces point along X axis (toward neighbors)
    });
  }

  // Store reference to toggle organization function in group userData
  group.userData.organizeBlocks = () => {
    isOrganized = !isOrganized;
    if (isOrganized) {
      console.log('📐 Organizing blocks into line...');
    } else {
      console.log('🌀 Returning blocks to chaos...');
    }
  };

  // Main description panel - positioned in front of spawn
  const descPanel = createTextPanel({
    title: "Simplicity Over Complexity",
    body: [
      "Complexity is enticing. It feels comprehensive.",
      "",
      "But simplicity is harder — and more powerful.",
      "",
      "Press E while looking at any code block to toggle organization.",
    ],
    width: 9,
    height: 4.5,
  });
  descPanel.position.set(0, 4.2, -12);
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

  // Create new organized wires that will update dynamically
  const organizedWires = [];

  for (let i = 0; i < codeBlocks.length - 1; i++) {
    const wireMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0,
      roughness: 0.6,
      transparent: true,
      opacity: 0,
    });

    // Create a simple cylinder that we'll update each frame
    const tubeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    const wire = new THREE.Mesh(tubeGeometry, wireMaterial);
    wire.userData.startBlockIndex = i;
    wire.userData.endBlockIndex = i + 1;
    group.add(wire);
    organizedWires.push(wire);
  }

  rooms.push({
    id: "room4",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -600),
    update: (time, delta) => {
      if (isOrganized) {
        // Animate blocks into organized line (SLOWER)
        codeBlocks.forEach((block, i) => {
          const target = lineTargets[i];

          // Smoothly move to target position (slower speed)
          block.position.lerp(target.position, delta * 0.8);

          // Smoothly rotate to aligned position (slower)
          block.rotation.x += (target.rotation.x - block.rotation.x) * delta * 1.5;
          block.rotation.y += (target.rotation.y - block.rotation.y) * delta * 1.5;
          block.rotation.z += (target.rotation.z - block.rotation.z) * delta * 1.5;

          // Keep emissive bright
          block.material.emissiveIntensity = 0.6;

          // Update lights
          codeLights[i].position.copy(block.position);
        });

        // Update messy wires to follow blocks, then fade them out
        wires.forEach((wire) => {
          const startBlock = codeBlocks[wire.userData.startBlockIndex];
          const endBlock = codeBlocks[wire.userData.endBlockIndex];
          const midOffset = wire.userData.midOffset;

          if (startBlock && endBlock) {
            // Calculate new curve based on current block positions
            const points = [
              startBlock.position.clone(),
              new THREE.Vector3(
                (startBlock.position.x + endBlock.position.x) / 2 + midOffset.x,
                (startBlock.position.y + endBlock.position.y) / 2 + midOffset.y,
                (startBlock.position.z + endBlock.position.z) / 2 + midOffset.z
              ),
              endBlock.position.clone(),
            ];

            const curve = new THREE.CatmullRomCurve3(points);
            const newGeometry = new THREE.TubeGeometry(curve, 20, 0.03, 8, false);

            // Replace old geometry with new one
            wire.geometry.dispose();
            wire.geometry = newGeometry;
          }

          // Fade out
          wire.material.emissiveIntensity = Math.max(0, wire.material.emissiveIntensity - delta * 0.5);
          wire.material.opacity = Math.max(0, wire.material.opacity - delta * 0.5);
        });

        // Update organized wires to follow blocks dynamically
        organizedWires.forEach((wire) => {
          const startBlock = codeBlocks[wire.userData.startBlockIndex];
          const endBlock = codeBlocks[wire.userData.endBlockIndex];

          if (startBlock && endBlock) {
            // Get current positions of the blocks
            const start = startBlock.position.clone();
            const end = endBlock.position.clone();

            // Calculate midpoint
            const midpoint = new THREE.Vector3(
              (start.x + end.x) / 2,
              (start.y + end.y) / 2,
              (start.z + end.z) / 2
            );

            // Position wire at midpoint
            wire.position.copy(midpoint);

            // Calculate length
            const length = start.distanceTo(end);
            wire.scale.y = length;

            // Calculate rotation to point from start to end (parallel, horizontal)
            const direction = new THREE.Vector3().subVectors(end, start).normalize();

            // Create quaternion to align wire with direction
            // Default cylinder points up (0, 1, 0), we want it to point in direction
            const up = new THREE.Vector3(0, 1, 0);
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(up, direction);
            wire.quaternion.copy(quaternion);
          }

          // Fade in gradually
          wire.material.emissiveIntensity = Math.min(0.6, wire.material.emissiveIntensity + delta * 0.4);
          wire.material.opacity = Math.min(1, wire.material.opacity + delta * 0.4);
        });

        // Brighten scene
        scene.fog.color.lerp(new THREE.Color(0x1a1a1a), delta * 0.3);
      } else {
        // Return to messy floating state
        codeBlocks.forEach((block, i) => {
          const floatOffset = block.userData.floatOffset;
          const originalPos = block.userData.originalPos;
          const originalRot = block.userData.originalRot;

          // Animate back to original position with floating
          const targetPos = originalPos.clone();
          targetPos.y = originalPos.y + Math.sin(time + floatOffset) * 0.2;

          block.position.lerp(targetPos, delta * 0.8);

          // Animate back to original rotation (with spinning)
          block.rotation.x += (originalRot.x - block.rotation.x) * delta * 1.5;
          block.rotation.y += delta * 0.2; // Continue spinning
          block.rotation.z += (originalRot.z - block.rotation.z) * delta * 1.5;

          // Pulse emissive
          const pulse = 0.8 + Math.sin(time * 2 + floatOffset) * 0.3;
          block.material.emissiveIntensity = pulse;

          // Update lights
          if (codeLights[i]) {
            codeLights[i].position.copy(block.position);
          }
        });

        // Update messy wires to follow floating blocks
        wires.forEach((wire) => {
          const startBlock = codeBlocks[wire.userData.startBlockIndex];
          const endBlock = codeBlocks[wire.userData.endBlockIndex];
          const midOffset = wire.userData.midOffset;

          if (startBlock && endBlock) {
            // Calculate new curve based on current block positions
            const points = [
              startBlock.position.clone(),
              new THREE.Vector3(
                (startBlock.position.x + endBlock.position.x) / 2 + midOffset.x,
                (startBlock.position.y + endBlock.position.y) / 2 + midOffset.y,
                (startBlock.position.z + endBlock.position.z) / 2 + midOffset.z
              ),
              endBlock.position.clone(),
            ];

            const curve = new THREE.CatmullRomCurve3(points);
            const newGeometry = new THREE.TubeGeometry(curve, 20, 0.03, 8, false);

            // Replace old geometry with new one
            wire.geometry.dispose();
            wire.geometry = newGeometry;
          }

          // Fade in messy wires
          wire.material.emissiveIntensity = Math.min(0.2, wire.material.emissiveIntensity + delta * 0.5);
          wire.material.opacity = Math.min(1, wire.material.opacity + delta * 0.5);
        });

        // Fade out organized wires
        organizedWires.forEach((wire) => {
          wire.material.emissiveIntensity = Math.max(0, wire.material.emissiveIntensity - delta * 0.4);
          wire.material.opacity = Math.max(0, wire.material.opacity - delta * 0.4);
        });
      }
    },
  });

  scene.add(group);
  return group;
}
