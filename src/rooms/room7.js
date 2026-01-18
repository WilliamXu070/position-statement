import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createTextPanel } from "../utils/textPanel.js";

// ROOM 7: Fog Bridge - Reflection, growth
export function createRoom7(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -1200);

  scene.background = new THREE.Color(0x708090);
  scene.fog = new THREE.FogExp2(0x708090, 0.015);

  // Infinite fog bridge platform
  const bridge = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
      color: 0x556b2f,
      roughness: 0.8,
    })
  );
  bridge.rotation.x = -Math.PI / 2;
  bridge.position.y = 0;
  group.add(bridge);

  // Incomplete structures ahead
  const structures = [];
  for (let i = 0; i < 8; i++) {
    const complete = Math.random() > 0.5;
    const structure = new THREE.Mesh(
      new THREE.BoxGeometry(
        2 + Math.random() * 2,
        complete ? 4 + Math.random() * 3 : (2 + Math.random() * 2) * 0.5,
        2 + Math.random() * 2
      ),
      new THREE.MeshStandardMaterial({
        color: complete ? 0x8b7355 : 0x696969,
        roughness: 0.7,
      })
    );
    structure.position.set(
      (Math.random() - 0.5) * 15,
      complete ? 2 + Math.random() * 1.5 : 0.5,
      -10 - i * 4
    );
    group.add(structure);
    structures.push(structure);
  }

  // Soft light breaking through
  const lightBeams = [];
  for (let i = 0; i < 5; i++) {
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(
      (Math.random() - 0.5) * 10,
      20 + Math.random() * 10,
      -15 - i * 5
    );
    scene.add(light);
    lightBeams.push(light);
  }

  // Text panels
  const panel1 = createTextPanel({
    title: "Reflection – Where I Am Now",
    body: [
      "I know my understanding of engineering design is still developing.",
      "I am still learning how to connect all the pieces — technical knowledge, creativity, and real-world impact.",
      "",
      "I want to strengthen my coding skills, especially in AI and machine learning, so I can contribute meaningfully in the future.",
      "That is why I continue to challenge myself with projects like building websites and new tools.",
      "",
      "Growth, to me, is part of the process.",
    ],
    width: 8,
    height: 4,
  });
  panel1.position.set(0, 3, -12);
  group.add(panel1);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  rooms.push({
    id: "room7",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -1200),
    update: (time, delta) => {
      // Structures can collapse/rebuild
      structures.forEach((structure, i) => {
        if (Math.random() < 0.001) {
          structure.scale.y = Math.random() > 0.5 ? 1 : 0.3;
        }
      });
    },
  });

  scene.add(group);
  return group;
}
