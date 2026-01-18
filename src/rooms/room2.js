import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createTextPanel } from "../utils/textPanel.js";

// ROOM 2: Challenging Assumptions - Breaking the Glass Wall
export function createRoom2(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -200);

  // Dark, confined space
  scene.background = new THREE.Color(0x1a1a1a);
  scene.fog = new THREE.Fog(0x1a1a1a, 5, 40);

  // Dark floor
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.9,
      metalness: 0.1,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);
  spellTargets.push(platform);

  // Tall dark walls on sides
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8,
  });

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(1, 10, 40),
    wallMaterial
  );
  leftWall.position.set(-12, 5, 0);
  group.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(1, 10, 40),
    wallMaterial
  );
  rightWall.position.set(12, 5, 0);
  group.add(rightWall);

  // Red warning text on walls
  const warnings = [
    "You need institutional data.",
    "You're not trained.",
    "Normal people can't compete.",
    "It's impossible.",
  ];

  warnings.forEach((text, i) => {
    const warningPanel = createTextPanel({
      title: text,
      body: [],
      width: 4,
      height: 1.2,
    });
    // Alternate between left and right walls
    const side = i % 2 === 0 ? -10 : 10;
    const zPos = -15 + (i * 10);
    warningPanel.position.set(side, 3 + Math.random() * 2, zPos);
    warningPanel.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    warningPanel.material = new THREE.MeshStandardMaterial({
      map: warningPanel.material.map,
      emissive: 0xff0000,
      emissiveIntensity: 0.5,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    group.add(warningPanel);
  });

  // Glass wall blocking path
  const glassGeometry = new THREE.PlaneGeometry(20, 8);
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.9,
    side: THREE.DoubleSide,
  });
  const glassWall = new THREE.Mesh(glassGeometry, glassMaterial);
  glassWall.position.set(0, 4, -10);
  glassWall.userData.clickable = true;
  glassWall.userData.broken = false;
  glassWall.userData.crackProgress = 0;
  group.add(glassWall);
  spellTargets.push(glassWall);

  // Glass wall edges (frame)
  const edgesGeometry = new THREE.EdgesGeometry(glassGeometry);
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0x66aaff,
    linewidth: 2
  });
  const glassEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  glassWall.add(glassEdges);

  // Bright hallway behind glass (revealed when broken)
  const hallwayLight = new THREE.PointLight(0xffffff, 0, 30);
  hallwayLight.position.set(0, 4, -25);
  scene.add(hallwayLight);

  // Hallway geometry
  const hallwayFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 30),
    new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.8,
    })
  );
  hallwayFloor.rotation.x = -Math.PI / 2;
  hallwayFloor.position.set(0, 0, -25);
  hallwayFloor.visible = false;
  group.add(hallwayFloor);

  // Description panel
  const descPanel = createTextPanel({
    title: "Challenging Assumptions",
    body: [
      "Everyone said normal people can't compete in quantitative finance.",
      "",
      "I treated that as a hypothesis, not a limitation.",
      "",
      "Click the glass wall to break through doubt.",
    ],
    width: 8,
    height: 4.5,
  });
  descPanel.position.set(0, 3, 5);
  group.add(descPanel);

  // Dim lighting
  const ambientLight = new THREE.AmbientLight(0x4a4a4a, 0.3);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xff6666, 0.8, 30, Math.PI / 6);
  spotLight.position.set(0, 10, 0);
  scene.add(spotLight);

  rooms.push({
    id: "room2",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -200),
    update: (time, delta) => {
      // If glass wall clicked, animate breaking
      if (glassWall.userData.broken) {
        glassWall.userData.crackProgress += delta * 2;

        // Fade out glass
        glassMaterial.opacity = Math.max(0, 0.3 - glassWall.userData.crackProgress * 0.5);

        // Brighten hallway
        hallwayLight.intensity = Math.min(2, glassWall.userData.crackProgress * 2);
        hallwayFloor.visible = glassWall.userData.crackProgress > 0.5;

        // Remove glass when fully broken
        if (glassWall.userData.crackProgress > 1 && glassWall.visible) {
          glassWall.visible = false;
        }
      }

      // Pulse warning text
      group.traverse((child) => {
        if (child.material && child.material.emissive) {
          const pulse = 0.3 + Math.sin(time * 3 + child.position.z) * 0.2;
          child.material.emissiveIntensity = pulse;
        }
      });
    },
  });

  scene.add(group);
  return group;
}
