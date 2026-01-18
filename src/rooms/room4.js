import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createTextPanel } from "../utils/textPanel.js";

// ROOM 4: Floating Workshop - Iteration, failure, persistence
export function createRoom4(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -600);

  scene.background = new THREE.Color(0xb0c4de);
  scene.fog = new THREE.FogExp2(0xb0c4de, 0.004);

  // Infinite floating workshop platform
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
      color: 0x708090,
      roughness: 0.7,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);

  // Half-built machines floating
  const machines = [];
  for (let i = 0; i < 10; i++) {
    const machine = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1 + Math.random(), 0.5, 1 + Math.random()),
      new THREE.MeshStandardMaterial({
        color: 0x556b2f,
        roughness: 0.8,
      })
    );
    machine.add(base);

    // Incomplete parts
    const parts = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < parts; j++) {
      const part = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5 + Math.random() * 1, 0.5),
        new THREE.MeshStandardMaterial({
          color: 0x8b7355,
          roughness: 0.7,
        })
      );
      part.position.set(
        (Math.random() - 0.5) * 2,
        0.5 + j * 0.8,
        (Math.random() - 0.5) * 2
      );
      machine.add(part);
    }

    machine.position.set(
      (Math.random() - 0.5) * 20,
      1 + Math.random() * 5,
      (Math.random() - 0.5) * 20
    );
    machine.userData.floatSpeed = 0.3 + Math.random() * 0.3;
    machine.userData.floatOffset = Math.random() * Math.PI * 2;
    group.add(machine);
    machines.push(machine);
  }

  // Floating tools
  const tools = [];
  for (let i = 0; i < 15; i++) {
    const tool = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 1, 0.1),
      new THREE.MeshStandardMaterial({
        color: 0x696969,
        metalness: 0.8,
        roughness: 0.3,
      })
    );
    tool.position.set(
      (Math.random() - 0.5) * 25,
      2 + Math.random() * 8,
      (Math.random() - 0.5) * 25
    );
    tool.userData.orbitRadius = 1 + Math.random() * 2;
    tool.userData.orbitSpeed = 0.5 + Math.random() * 0.5;
    tool.userData.orbitAngle = Math.random() * Math.PI * 2;
    tool.userData.initialPosition = tool.position.clone();
    group.add(tool);
    tools.push(tool);
  }

  // Text panels
  const panel1 = createTextPanel({
    title: "How I Practice Engineering Design",
    body: [
      "My approach to engineering design is shaped by ambition, structure, and learning through failure.",
      "I start with big ideas, but I rely on the design process to turn them into something real.",
      "",
      "I don't expect things to work the first time.",
      "I expect to fail, adapt, and improve.",
    ],
    width: 8,
    height: 4,
  });
  panel1.position.set(0, 3, -12);
  group.add(panel1);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const workshopLight = new THREE.DirectionalLight(0xffffff, 0.7);
  workshopLight.position.set(5, 15, 5);
  scene.add(workshopLight);

  rooms.push({
    id: "room4",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -600),
    update: (time, delta) => {
      machines.forEach((machine) => {
        machine.position.y += Math.sin(time * machine.userData.floatSpeed + machine.userData.floatOffset) * 0.01;
        machine.rotation.y += delta * 0.2;
      });

      tools.forEach((tool) => {
        tool.userData.orbitAngle += tool.userData.orbitSpeed * delta;
        const offset = new THREE.Vector3(
          Math.cos(tool.userData.orbitAngle) * tool.userData.orbitRadius,
          Math.sin(tool.userData.orbitAngle * 0.7) * tool.userData.orbitRadius * 0.5,
          Math.sin(tool.userData.orbitAngle) * tool.userData.orbitRadius
        );
        tool.position.copy(tool.userData.initialPosition).add(offset);
        tool.rotation.x += delta;
        tool.rotation.z += delta * 0.7;
      });
    },
  });

  scene.add(group);
  return group;
}
