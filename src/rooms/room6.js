import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createTextPanel } from "../utils/textPanel.js";

// ROOM 6: Mirror Labyrinth - Personal challenge
export function createRoom6(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -1000);

  scene.background = new THREE.Color(0x2a2a3a);
  scene.fog = new THREE.FogExp2(0x2a2a3a, 0.01);

  // Mirror walls in a maze pattern
  const mirrorMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.1,
    metalness: 0.9,
    side: THREE.DoubleSide,
  });

  const mirrors = [];
  const mazePattern = [
    [0, 0, 5, 0.3, 4],
    [3, 0, 0.3, 4, 0],
    [-3, 0, 0.3, 4, 0],
    [0, 0, -5, 0.3, 4],
    [6, 0, 0, 0.3, 4],
    [-6, 0, 0, 0.3, 4],
  ];

  mazePattern.forEach(([x, y, z, w, h]) => {
    const mirror = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      mirrorMaterial.clone()
    );
    mirror.position.set(x, y + h / 2, z);
    if (z === 0) {
      mirror.rotation.y = Math.PI / 2;
    }
    group.add(mirror);
    mirrors.push(mirror);
  });

  // Shadow figure in distance
  const shadow = new THREE.Mesh(
    new THREE.BoxGeometry(1, 3, 0.5),
    new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x1a1a1a,
      emissiveIntensity: 0.3,
    })
  );
  shadow.position.set(0, 1.5, -15);
  group.add(shadow);

  // Text panels
  const panel1 = createTextPanel({
    title: "Experience 2 – Personal: Being Challenged",
    body: [
      "My older sister has always been harsh with my ideas.",
      "",
      "Whenever I told her about a project, she would point out how it might fail, how it had already been done, or why it wasn't realistic.",
      "",
      "When I wanted to build a cryptocurrency trading algorithm, she told me I didn't have the financial background and encouraged me to talk to her friends who worked in banks.",
      "",
      "At first, I took this personally.",
      "I thought she was insulting my intelligence and preparation.",
      "",
      "Over time, I realized she wasn't trying to discourage me.",
      "She was trying to make me think more critically.",
      "",
      "I learned resilience.",
      "I learned how to accept criticism without shutting down.",
      "",
      "Because of her constant challenges, I changed how I approach engineering.",
      "",
      "I stopped assuming I knew enough.",
      "I started approaching problems with humility and curiosity.",
      "",
      "I eventually spoke with her friends, learned the financial fundamentals, and built a trading algorithm that achieved 80% theoretical returns over one year of testing.",
      "",
      "This experience taught me that ego can motivate you,",
      "but humility is what helps you improve.",
    ],
    width: 9,
    height: 10,
  });
  panel1.position.set(0, 3, -12);
  group.add(panel1);

  const ambientLight = new THREE.AmbientLight(0x4a4a5a, 0.4);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffffff, 0.8, 30, Math.PI / 6, 0.5);
  spotLight.position.set(0, 10, 5);
  scene.add(spotLight);

  rooms.push({
    id: "room6",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -1000),
    update: (time, delta) => {
      shadow.position.x += Math.sin(time * 0.5) * 0.02;
      shadow.rotation.y = Math.sin(time * 0.3) * 0.2;
    },
  });

  scene.add(group);
  return group;
}
