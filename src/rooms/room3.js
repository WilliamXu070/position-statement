import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";

// ROOM 3: First Principles Engineering Process Interface
export function createRoom3(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -400);

  // This room is purely UI-based - no 3D content needed
  // The overlay will be triggered when teleporting to this room

  // Simple clean environment (mostly hidden behind overlay)
  scene.background = new THREE.Color(0x667eea);
  scene.fog = null;

  // Simple floor
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.8,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);

  // Basic lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  rooms.push({
    id: "room3",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -400),
  });

  scene.add(group);
  return group;
}
