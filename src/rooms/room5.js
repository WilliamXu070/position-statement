import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createTextPanel } from "../utils/textPanel.js";

// ROOM 5: Speed & Iteration (Hackathons)
export function createRoom5(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -800);

  // Dynamic, energetic environment
  scene.background = new THREE.Color(0x1a1a0a);
  scene.fog = new THREE.Fog(0x1a1a0a, 10, 60);

  // Dark floor with grid lines
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
      color: 0x2a2a1a,
      roughness: 0.9,
      metalness: 0.1,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);
  spellTargets.push(platform);

  // Grid lines on floor
  const gridHelper = new THREE.GridHelper(40, 40, 0xff8800, 0x664400);
  gridHelper.position.y = 0.01;
  group.add(gridHelper);

  // Conveyor belt visualization (central strip)
  const beltGeometry = new THREE.PlaneGeometry(6, 50);
  const beltMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a2a,
    roughness: 0.8,
    emissive: 0x2a2a1a,
    emissiveIntensity: 0.3,
  });
  const belt = new THREE.Mesh(beltGeometry, beltMaterial);
  belt.rotation.x = -Math.PI / 2;
  belt.position.set(0, 0.05, -10);
  group.add(belt);

  // Belt edge markers
  for (let i = 0; i < 20; i++) {
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.1, 0.8),
      new THREE.MeshStandardMaterial({
        color: 0xff8800,
        emissive: 0xff6600,
        emissiveIntensity: 0.5,
      })
    );
    marker.position.set(2.8, 0.1, -25 + i * 2.5);
    marker.userData.initialZ = marker.position.z;
    group.add(marker);

    const marker2 = marker.clone();
    marker2.position.x = -2.8;
    marker2.userData.initialZ = marker2.position.z;
    group.add(marker2);
  }

  // Project cards flying past
  const projectCards = [];
  const projectData = [
    { title: "Invoice OCR", subtitle: "24hr build", color: 0xff6644 },
    { title: "ML Classifier", subtitle: "Rapid prototype", color: 0x4488ff },
    { title: "API Gateway", subtitle: "Sprint delivery", color: 0x44ff88 },
    { title: "Data Pipeline", subtitle: "Fast iteration", color: 0xffaa44 },
    { title: "Mobile App", subtitle: "Quick MVP", color: 0xff44ff },
    { title: "Trading Bot", subtitle: "Speed test", color: 0x44ffff },
  ];

  projectData.forEach((project, i) => {
    const card = createTextPanel({
      title: project.title,
      body: [project.subtitle],
      width: 4,
      height: 2.5,
    });

    card.position.set(
      (Math.random() - 0.5) * 4,
      2 + Math.random() * 1,
      -30 + i * 8
    );

    card.material = new THREE.MeshStandardMaterial({
      map: card.material.map,
      emissive: project.color,
      emissiveIntensity: 0.6,
      color: 0x2a2a2a,
      roughness: 0.7,
      side: THREE.DoubleSide,
    });

    card.userData.clickable = true;
    card.userData.locked = false;
    card.userData.speed = 3 + Math.random() * 2;
    card.userData.originalEmissive = project.color;
    card.userData.initialZ = card.position.z;

    group.add(card);
    projectCards.push(card);
    spellTargets.push(card);
  });

  // Large timer/speed indicator
  const timerPanel = createTextPanel({
    title: "24:00:00",
    body: ["Time Remaining"],
    width: 5,
    height: 2.5,
  });
  timerPanel.position.set(-8, 4, -5);
  timerPanel.material = new THREE.MeshStandardMaterial({
    map: timerPanel.material.map,
    emissive: 0xff3300,
    emissiveIntensity: 0.7,
    color: 0x1a1a1a,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  group.add(timerPanel);

  // Speed indicators (moving arrows)
  const arrowGeometry = new THREE.ConeGeometry(0.3, 1, 3);
  const arrows = [];
  for (let i = 0; i < 5; i++) {
    const arrow = new THREE.Mesh(
      arrowGeometry,
      new THREE.MeshStandardMaterial({
        color: 0xff8800,
        emissive: 0xff6600,
        emissiveIntensity: 0.8,
      })
    );
    arrow.rotation.x = Math.PI / 2;
    arrow.position.set(8, 3 - i * 0.5, -10 - i * 2);
    arrow.userData.initialZ = arrow.position.z;
    group.add(arrow);
    arrows.push(arrow);
  }

  // Main description panel
  const descPanel = createTextPanel({
    title: "Speed & Iteration",
    body: [
      "Hackathons taught me to build fast and iterate faster.",
      "",
      "Move quickly, test ideas, learn from failures.",
      "",
      "Click a project card to lock it and refine it.",
    ],
    width: 9,
    height: 4.5,
  });
  descPanel.position.set(0, 3.5, 8);
  group.add(descPanel);

  // Refinement workspace (appears when card locked)
  const workspacePanel = createTextPanel({
    title: "Refinement Mode",
    body: [
      "Now we iterate:",
      "→ Test edge cases",
      "→ Optimize performance",
      "→ Polish UX",
    ],
    width: 6,
    height: 4,
  });
  workspacePanel.position.set(0, 3, -15);
  workspacePanel.visible = false;
  workspacePanel.material = new THREE.MeshStandardMaterial({
    map: workspacePanel.material.map,
    emissive: 0x44ff88,
    emissiveIntensity: 0,
    color: 0x1a1a1a,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  group.add(workspacePanel);

  // Energetic lighting
  const ambientLight = new THREE.AmbientLight(0x4a3a2a, 0.4);
  scene.add(ambientLight);

  const orangeLight1 = new THREE.PointLight(0xff8800, 1.5, 25);
  orangeLight1.position.set(-8, 5, -5);
  scene.add(orangeLight1);

  const orangeLight2 = new THREE.PointLight(0xffaa44, 1.5, 25);
  orangeLight2.position.set(8, 5, -5);
  scene.add(orangeLight2);

  const timerLight = new THREE.PointLight(0xff3300, 1, 15);
  timerLight.position.set(-8, 5, -5);
  scene.add(timerLight);

  let elapsedTime = 0;

  rooms.push({
    id: "room5",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -800),
    update: (time, delta) => {
      elapsedTime += delta;

      // Move belt markers forward
      group.traverse((child) => {
        if (child.userData.initialZ !== undefined && child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry) {
          child.position.z += delta * 5;
          if (child.position.z > 5) {
            child.position.z = child.userData.initialZ;
          }
        }
      });

      // Move arrows forward
      arrows.forEach((arrow) => {
        arrow.position.z += delta * 8;
        if (arrow.position.z > 5) {
          arrow.position.z = arrow.userData.initialZ;
        }
      });

      // Move project cards or keep locked ones in place
      projectCards.forEach((card) => {
        if (card.userData.locked) {
          // Locked card moves to center and stays
          card.position.x += (0 - card.position.x) * delta * 2;
          card.position.y += (2.5 - card.position.y) * delta * 2;
          card.position.z += (-8 - card.position.z) * delta * 2;
          card.rotation.y += (0 - card.rotation.y) * delta * 3;

          // Show refinement workspace
          workspacePanel.visible = true;
          workspacePanel.material.emissiveIntensity = 0.6;

          // Change card color to green (refined)
          card.material.emissive.lerp(new THREE.Color(0x44ff88), delta * 2);
        } else {
          // Cards fly past on conveyor
          card.position.z += delta * card.userData.speed;
          if (card.position.z > 10) {
            card.position.z = card.userData.initialZ;
          }

          // Gentle rotation and float
          card.rotation.y += delta * 0.5;
          card.position.y += Math.sin(time * 2 + card.position.z * 0.1) * 0.01;
        }

        // Pulse emissive
        const pulse = 0.6 + Math.sin(time * 3 + card.position.z) * 0.2;
        if (!card.userData.locked) {
          card.material.emissiveIntensity = pulse;
        }
      });

      // Update timer (countdown effect)
      const hours = Math.floor((24 - elapsedTime / 3) % 24);
      const minutes = Math.floor((elapsedTime * 10) % 60);
      const seconds = Math.floor((elapsedTime * 100) % 60);
      // Timer is visual only, no text update needed

      // Pulse timer
      const timerPulse = 0.7 + Math.sin(time * 4) * 0.3;
      timerPanel.material.emissiveIntensity = timerPulse;
      timerLight.intensity = timerPulse * 1.5;

      // Flicker lights
      orangeLight1.intensity = 1.5 + Math.sin(time * 5) * 0.3;
      orangeLight2.intensity = 1.5 + Math.sin(time * 5 + Math.PI) * 0.3;
    },
  });

  scene.add(group);
  return group;
}
