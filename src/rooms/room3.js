import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createTextPanel } from "../utils/textPanel.js";

// ROOM 3: Sky Garden - Values, humanity, impact
export function createRoom3(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -400);

  scene.background = new THREE.Color(0xe0f6ff);
  scene.fog = new THREE.FogExp2(0xe0f6ff, 0.003);

  // Infinite garden platform
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
      color: 0x90ee90,
      roughness: 0.8,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);

  // Circuit board trees
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 8 + Math.random() * 6;
    const tree = new THREE.Group();

    // Trunk (circuit board style)
    const trunk = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 3 + Math.random() * 2, 0.3),
      new THREE.MeshStandardMaterial({
        color: 0x2a5a2a,
        emissive: 0x1a3a1a,
        emissiveIntensity: 0.3,
      })
    );
    trunk.position.y = 1.5;
    tree.add(trunk);

    // Circuit pattern on trunk
    const circuit = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 3),
      new THREE.MeshStandardMaterial({
        color: 0x4a8a4a,
        emissive: 0x2a6a2a,
        emissiveIntensity: 0.5,
      })
    );
    circuit.rotation.y = Math.PI / 2;
    tree.add(circuit);

    // Leaves (glowing spheres)
    for (let j = 0; j < 5; j++) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0x4a8a4a,
          emissive: 0x2a6a2a,
          emissiveIntensity: 0.6,
        })
      );
      leaf.position.set(
        (Math.random() - 0.5) * 1.5,
        3 + Math.random() * 1.5,
        (Math.random() - 0.5) * 1.5
      );
      tree.add(leaf);
    }

    tree.position.set(
      Math.cos(angle) * distance,
      0,
      Math.sin(angle) * distance
    );
    group.add(tree);
  }

  // Golden microscope shrine
  const shrine = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1.2, 0.5, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.2,
    })
  );
  base.position.y = 0.25;
  shrine.add(base);

  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 2, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.2,
    })
  );
  column.position.y = 1.5;
  shrine.add(column);

  const lens = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffaa,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.7,
    })
  );
  lens.position.y = 2.8;
  shrine.add(lens);

  shrine.position.set(0, 0, 0);
  group.add(shrine);

  // Text panels
  const panel1 = createTextPanel({
    title: "My Values",
    body: [
      "What drives me is change.",
      "I want to make an impact.",
      "Sometimes that comes from my ego — the desire to prove people wrong, to show what I am capable of.",
      "",
      "But more importantly, I care about helping others.",
      "",
      "I value the idea of making life easier for the people who come after me.",
      "I want my experiences to become a kind of vessel — something others can use to accomplish their own dreams.",
      "",
      "This is why I am passionate about healthcare and accessibility.",
      "My work on cellphone-based microscopes was not just about building technology.",
      "It was about giving people in resource-limited communities access to tools that could help them learn, diagnose, and potentially save lives.",
      "",
      "That motivation is what pushed me to build.",
    ],
    width: 8,
    height: 7,
  });
  panel1.position.set(0, 3, -12);
  group.add(panel1);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfff8dc, 1.0);
  sunLight.position.set(10, 30, 10);
  scene.add(sunLight);

  rooms.push({
    id: "room3",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -400),
    update: (time, delta) => {
      shrine.rotation.y += delta * 0.3;
    },
  });

  scene.add(group);
  return group;
}
