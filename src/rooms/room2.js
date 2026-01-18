import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EYE_HEIGHT } from "../constants.js";
import { addModelCollision } from "../core/collision.js";

// ROOM 2: Meeting Room - Stonks Discussion
export function createRoom2(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -200);

  // Corporate office lighting
  scene.background = new THREE.Color(0x4a5a6a); // Darker neutral gray-blue
  scene.fog = new THREE.Fog(0x4a5a6a, 20, 60);

  // Simple floor as fallback
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
      color: 0x8b8b8b,
      roughness: 0.8,
      metalness: 0.2,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);
  spellTargets.push(platform);

  const loader = new GLTFLoader();

  // Load meeting room
  loader.load(
    'models/meeting_room.glb',
    (gltf) => {
      const meetingRoom = gltf.scene;
      meetingRoom.name = 'meetingRoom';

      // Position and scale the meeting room
      meetingRoom.position.set(0, 0, -10);
      meetingRoom.scale.set(10, 10, 10);

      group.add(meetingRoom);

      // Add collision detection for the entire room
      addModelCollision(meetingRoom, group.position);

      // Make room clickable
      meetingRoom.traverse((child) => {
        if (child.isMesh) {
          spellTargets.push(child);
        }
      });

      console.log('✅ Loaded meeting room');
    },
    (progress) => {
      console.log('Loading meeting room:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
    },
    (error) => {
      console.error('❌ Error loading meeting room:', error);
    }
  );

  // Load businessman character
  loader.load(
    'models/drex__human_3d_character.glb',
    (gltf) => {
      const businessman = gltf.scene;
      businessman.name = 'businessman';

      // Position the businessman at the table
      businessman.position.set(-3, 0, -12);
      businessman.scale.set(1.5, 1.5, 1.5);
      businessman.rotation.y = Math.PI / 4; // Face partially toward player

      group.add(businessman);

      // Add collision for businessman
      addModelCollision(businessman, group.position);

      // Make businessman clickable
      businessman.traverse((child) => {
        if (child.isMesh) {
          spellTargets.push(child);
          child.userData.businessman = true;
        }
      });

      console.log('✅ Loaded businessman');
    },
    (progress) => {
      console.log('Loading businessman:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
    },
    (error) => {
      console.error('❌ Error loading businessman:', error);
    }
  );

  // Load stonks head
  loader.load(
    'models/stonks_head.glb',
    (gltf) => {
      const stonksHead = gltf.scene;
      stonksHead.name = 'stonksHead';

      // Position stonks head on the table or floating
      stonksHead.position.set(3, 2, -12);
      stonksHead.scale.set(0.8, 0.8, 0.8);

      group.add(stonksHead);

      // Make stonks head clickable and interactive
      stonksHead.traverse((child) => {
        if (child.isMesh) {
          spellTargets.push(child);
          child.userData.stonks = true;
        }
      });

      // Store reference for animation
      stonksHead.userData.rotationSpeed = 0.5;
      stonksHead.userData.bobSpeed = 2;
      stonksHead.userData.bobAmount = 0.2;

      console.log('✅ Loaded stonks head');
    },
    (progress) => {
      console.log('Loading stonks head:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
    },
    (error) => {
      console.error('❌ Error loading stonks head:', error);
    }
  );

  // === LIGHTING ===

  // Ambient office lighting (reduced from 0.7 to 0.4)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Overhead lights (reduced from 1.5 to 0.8)
  const ceilingLight1 = new THREE.PointLight(0xffffff, 0.8, 25);
  ceilingLight1.position.set(-5, 8, -10);
  scene.add(ceilingLight1);

  const ceilingLight2 = new THREE.PointLight(0xffffff, 0.8, 25);
  ceilingLight2.position.set(5, 8, -10);
  scene.add(ceilingLight2);

  // Directional light (window light) - reduced from 0.8 to 0.5
  const sunLight = new THREE.DirectionalLight(0xfff8e7, 0.5);
  sunLight.position.set(10, 15, 0);
  scene.add(sunLight);

  // Spotlight on stonks head
  const stonksSpot = new THREE.SpotLight(0xffd700, 0.5, 15, Math.PI / 6);
  stonksSpot.position.set(3, 6, -10);
  stonksSpot.target.position.set(3, 2, -12);
  scene.add(stonksSpot);
  scene.add(stonksSpot.target);

  rooms.push({
    id: "room2",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -200),
    update: (time, delta) => {
      // Animate stonks head
      group.traverse((child) => {
        if (child.name === 'stonksHead') {
          // Rotate
          child.rotation.y += delta * child.userData.rotationSpeed;

          // Bob up and down
          const bobOffset = Math.sin(time * child.userData.bobSpeed) * child.userData.bobAmount;
          child.position.y = 2 + bobOffset;
        }
      });
    },
  });

  scene.add(group);
  return group;
}
