import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createTextPanel } from "../utils/textPanel.js";

// ROOM 2: Sky Structures - Structure, logic, understanding
export function createRoom2(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -200);

  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.FogExp2(0x87ceeb, 0.005);

  // Infinite invisible platform
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.1,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);

  // Floating geometric shapes
  const shapes = [];
  const shapeMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x4a90e2, emissive: 0x1a4a7a, emissiveIntensity: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0x5aa3e8, emissive: 0x1a4a7a, emissiveIntensity: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0x6ab6ee, emissive: 0x1a4a7a, emissiveIntensity: 0.5 }),
  ];

  for (let i = 0; i < 20; i++) {
    const type = Math.floor(Math.random() * 3);
    let geometry;
    if (type === 0) {
      geometry = new THREE.BoxGeometry(1, 1, 1);
    } else if (type === 1) {
      geometry = new THREE.SphereGeometry(0.5, 16, 16);
    } else {
      geometry = new THREE.OctahedronGeometry(0.6);
    }

    const mesh = new THREE.Mesh(geometry, shapeMaterials[type]);
    mesh.position.set(
      (Math.random() - 0.5) * 30,
      Math.random() * 15 + 2,
      (Math.random() - 0.5) * 30
    );
    mesh.userData.initialPosition = mesh.position.clone();
    mesh.userData.orbitRadius = 2 + Math.random() * 3;
    mesh.userData.orbitSpeed = 0.5 + Math.random() * 0.5;
    mesh.userData.orbitAngle = Math.random() * Math.PI * 2;
    group.add(mesh);
    shapes.push(mesh);
  }

  // Blueprint grid lines
  const gridHelper = new THREE.GridHelper(40, 40, 0x4a90e2, 0x2a5a8a);
  gridHelper.position.y = 0.1;
  group.add(gridHelper);

  // Text panels
  const panel1 = createTextPanel({
    title: "My Beliefs About Design",
    body: [
      "I believe design is the logical structure of ideas.",
      "It takes a problem, turns it into a set of constraints, and forces you to define what is actually possible.",
      "",
      "Design is not just about having an idea.",
      "It is about rigorously defining the criteria, limitations, and steps required to make that idea real.",
      "",
      "Each step in the process is like climbing a ladder of understanding.",
      "You move from imagination to clarity, and eventually to action.",
      "",
      "This belief shapes how I approach engineering:",
      "I don't just want to dream — I want to understand.",
    ],
    width: 8,
    height: 6,
  });
  panel1.position.set(0, 3, -12);
  group.add(panel1);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 20, 5);
  scene.add(directionalLight);

  rooms.push({
    id: "room2",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -200),
    update: (time, delta) => {
      shapes.forEach((shape) => {
        shape.userData.orbitAngle += shape.userData.orbitSpeed * delta;
        const offset = new THREE.Vector3(
          Math.cos(shape.userData.orbitAngle) * shape.userData.orbitRadius,
          Math.sin(shape.userData.orbitAngle * 0.7) * shape.userData.orbitRadius * 0.5,
          Math.sin(shape.userData.orbitAngle) * shape.userData.orbitRadius
        );
        shape.position.copy(shape.userData.initialPosition).add(offset);
        shape.rotation.x += delta * 0.5;
        shape.rotation.y += delta * 0.7;
      });
    },
  });

  scene.add(group);
  return group;
}
