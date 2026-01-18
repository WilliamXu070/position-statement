import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { EYE_HEIGHT, GRAVITY, JUMP_VELOCITY, GROUND_HEIGHT } from "./constants.js";
import { initTextureSystem } from "./utils/textures.js";
import { initTextPanelSystem } from "./utils/textPanel.js";
import { createWand, createLightningBeam, getSpellHit } from "./core/spells.js";
import { initAudioSystem, loadRoomAudio, playRoomAudio, pauseRoomAudio, resumeRoomAudio } from "./core/audio.js";
import { checkCollision, clearCollisions } from "./core/collision.js";
import { ROOM_CONFIGS } from "./rooms/roomConfig.js";
import { createRoom1 } from "./rooms/room1.js";
import { createRoom2 } from "./rooms/room2.js";
import { createRoom3 } from "./rooms/room3.js";
import { createRoom4 } from "./rooms/room4.js";
import { createRoom5 } from "./rooms/room5.js";
import { createRoom6 } from "./rooms/room6.js";

// ===== SCENE SETUP =====

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0f0f);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const audioLoader = new THREE.AudioLoader();
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

// Initialize utility systems
initTextureSystem(renderer, textureLoader);
initTextPanelSystem(renderer);
initAudioSystem(audioListener, audioLoader);

// ===== CONTROLS =====

const controls = new PointerLockControls(camera, document.body);
const startButton = document.getElementById("start");
const overlay = document.getElementById("overlay");
const prompt = document.getElementById("prompt");
const roomLabel = document.getElementById("room-label");
const restartButton = document.getElementById("restart");
const jailMessage = document.getElementById("jail-message");
const jailOverlay = document.getElementById("jail");
const pitchObject = controls.getObject().children[0] ?? controls.getObject();
const rollGroup = new THREE.Group();
pitchObject.remove(camera);
rollGroup.add(camera);
pitchObject.add(rollGroup);

startButton.addEventListener("click", () => {
  console.log('🖱️ Start button clicked');

  // Resume audio context (required by browsers for autoplay)
  if (audioListener.context.state === 'suspended') {
    audioListener.context.resume().then(() => {
      console.log('🔊 Audio context resumed');
    });
  }

  // Check if already locked
  if (document.pointerLockElement === renderer.domElement) {
    console.log('⚠️ Pointer already locked, skipping');
    return;
  }

  // Check cooldown period to prevent browser security blocking
  const timeSinceUnlock = Date.now() - lastUnlockTime;

  if (timeSinceUnlock < LOCK_COOLDOWN && lastUnlockTime > 0) {
    // Wait for cooldown to complete before requesting lock
    const remainingCooldown = LOCK_COOLDOWN - timeSinceUnlock;
    console.log(`⏱️ Waiting ${remainingCooldown}ms for browser security cooldown...`);

    setTimeout(() => {
      console.log('🔒 Requesting pointer lock after cooldown');
      try {
        controls.lock();
      } catch (error) {
        console.error('❌ Lock failed:', error);
      }
    }, remainingCooldown);
  } else {
    console.log('🔒 Requesting pointer lock...');
    try {
      controls.lock();
    } catch (error) {
      console.error('❌ Lock failed:', error);
    }
  }
});

const baseFov = camera.fov;

restartButton.addEventListener("click", () => {
  jailOverlay.classList.add("hidden");
  rollGroup.rotation.set(0, 0, 0);
  camera.fov = baseFov;
  camera.updateProjectionMatrix();
  renderer.domElement.style.filter = "";
  teleportToRoom(0);
  controls.lock();
});

// === PLANKTON OVERLAY SYSTEM ===

const planktonOverlay = document.getElementById("plankton-overlay");
let planktonVisible = false;

// Click handler for VIEW button in Room 3
renderer.domElement.addEventListener("click", () => {
  if (!controls.isLocked) return;

  // Raycast to detect clicks on objects
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects(spellTargets, true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;

    // Check if clicked object is the VIEW button
    if (clickedObject.userData.isViewButton) {
      planktonVisible = true;
      planktonOverlay.classList.remove("hidden");
      console.log('🔬 Showing plankton view');
    }
  }
});

let firstLock = true;
let lastUnlockTime = 0;
const LOCK_COOLDOWN = 150; // ms - minimum time between unlock and re-lock

controls.addEventListener("lock", () => {
  console.log('🔒 Lock event fired');
  overlay.style.display = "none";
  jailOverlay.classList.add("hidden");

  // Play audio on first lock (when user clicks Start)
  if (firstLock) {
    firstLock = false;
    // Small delay to ensure audio context is ready
    setTimeout(() => {
      playRoomAudio(ROOM_CONFIGS[currentRoomIndex].id);
      console.log('🎵 Starting audio for room', currentRoomIndex + 1);
    }, 100);
  } else {
    // Resume audio when re-locking (after pressing Escape)
    resumeRoomAudio();
  }
});

controls.addEventListener("unlock", () => {
  console.log('🔓 Unlock event fired');
  lastUnlockTime = Date.now(); // Track when unlock happened

  if (jailOverlay.classList.contains("hidden")) {
    overlay.style.display = "grid";
  }

  // Pause audio when user presses Escape
  pauseRoomAudio();
});

// Add error handler for pointer lock failures
document.addEventListener('pointerlockerror', () => {
  console.error('❌ Pointer lock error - browser security blocked the request');
});

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === renderer.domElement) {
    console.log('✅ Pointer locked successfully');
  } else {
    console.log('🔓 Pointer unlocked');
  }
});

camera.position.set(0, EYE_HEIGHT, 0);
scene.add(controls.getObject());

// ===== SPELL SYSTEM =====

const wand = createWand();
camera.add(wand);

const lightningBeam = createLightningBeam();
scene.add(lightningBeam.glowLine);
scene.add(lightningBeam.impact);
scene.add(lightningBeam.impactLight);

// ===== MOVEMENT STATE =====

const move = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();
const tempVec = new THREE.Vector3();
const tempVec2 = new THREE.Vector3();
const tempVec3 = new THREE.Vector3();
const tempVec4 = new THREE.Vector3();

// Jump and physics constants
let canJump = true;
let isOnGround = true;

// ===== GAME STATE =====

const rooms = [];
const roomGroups = [];
let currentRoomIndex = 0;
let roomTransitioning = false;
const spellTargets = [];
const effects = [];
const spellInput = {
  lightning: false,
};
const wandState = {
  channel: 0,
  recoil: 0,
};
const raycaster = new THREE.Raycaster();
const lastSpellTime = new Map();

// ===== AUDIO SYSTEM =====

loadRoomAudio(ROOM_CONFIGS);

// ===== ROOM SETUP =====

function setupRooms() {
  createRoom1(scene, rooms, spellTargets);
  createRoom2(scene, rooms, spellTargets);
  createRoom3(scene, rooms, spellTargets);
  createRoom4(scene, rooms, spellTargets);
  createRoom5(scene, rooms, spellTargets);
  createRoom6(scene, rooms, spellTargets);
}

setupRooms();

// Initialize room groups array and hide all except first
roomGroups.push(...rooms.map((r) => r.group));
roomGroups.forEach((group, i) => {
  group.visible = i === 0;
});

// ===== ROOM NAVIGATION =====

function teleportToRoom(index) {
  if (index < 0 || index >= rooms.length) {
    return;
  }

  roomTransitioning = true;
  currentRoomIndex = index;
  const room = rooms[index];
  const spawn = room.spawn.clone();
  controls.getObject().position.copy(spawn);
  velocity.set(0, 0, 0);
  canJump = true;
  isOnGround = true;

  // Clear collision boxes from previous room
  clearCollisions();

  // Hide plankton overlay when changing rooms
  if (planktonVisible) {
    planktonVisible = false;
    planktonOverlay.classList.add("hidden");
    console.log('🔬 Hiding plankton view (room change)');
  }

  roomLabel.textContent = ROOM_CONFIGS[index].label;

  // Hide all rooms, show current
  roomGroups.forEach((group, i) => {
    group.visible = i === index;
  });

  // Play room audio
  playRoomAudio(ROOM_CONFIGS[index].id);

  // Update spell targets
  spellTargets.length = 0;
  if (room.group) {
    room.group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        spellTargets.push(child);
      }
    });
  }

  roomTransitioning = false;
}

// Start in room 1
teleportToRoom(0);

// ===== INPUT HANDLING =====

const onKeyDown = (event) => {
  if (roomTransitioning) return;

  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      if (event.code === "ArrowUp" && !move.forward) {
        // Navigate to next room
        if (currentRoomIndex < rooms.length - 1) {
          teleportToRoom(currentRoomIndex + 1);
        }
      }
      move.forward = true;
      break;
    case "ArrowLeft":
    case "KeyA":
      move.left = true;
      break;
    case "ArrowDown":
    case "KeyS":
      if (event.code === "ArrowDown" && !move.backward) {
        // Navigate to previous room
        if (currentRoomIndex > 0) {
          teleportToRoom(currentRoomIndex - 1);
        }
      }
      move.backward = true;
      break;
    case "ArrowRight":
    case "KeyD":
      move.right = true;
      break;
    case "Digit1":
      spellInput.lightning = true;
      break;
    case "KeyH":
      returnToRoomCenter();
      break;
    case "Space":
      if (canJump && isOnGround) {
        velocity.y = JUMP_VELOCITY;
        canJump = false;
        isOnGround = false;
      }
      break;
    default:
      break;
  }
};

const onKeyUp = (event) => {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      move.forward = false;
      break;
    case "ArrowLeft":
    case "KeyA":
      move.left = false;
      break;
    case "ArrowDown":
    case "KeyS":
      move.backward = false;
      break;
    case "ArrowRight":
    case "KeyD":
      move.right = false;
      break;
    case "Digit1":
      spellInput.lightning = false;
      break;
    default:
      break;
  }
};

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

function returnToRoomCenter() {
  const room = rooms[currentRoomIndex];
  if (!room) {
    return;
  }
  const spawn = room.spawn.clone();
  controls.getObject().position.copy(spawn);
  velocity.set(0, 0, 0);
  canJump = true;
  isOnGround = true;
}

// ===== SPELL UPDATES =====

function updateWand(time, delta) {
  if (!wand.userData.basePosition || !wand.userData.baseRotation) {
    return;
  }
  const channelTarget = spellInput.lightning ? 1 : 0;
  wandState.channel += (channelTarget - wandState.channel) * Math.min(1, delta * 6);
  wandState.recoil = Math.max(0, wandState.recoil - delta * 3);

  const bob = Math.sin(time * 2.2) * 0.015;
  const sway = Math.sin(time * 1.6) * 0.02;
  const channelKick = wandState.channel * 0.05;
  const recoilKick = wandState.recoil * 0.06;

  wand.position
    .copy(wand.userData.basePosition)
    .add(tempVec.set(0, bob, 0))
    .add(tempVec2.set(0, 0, -channelKick - recoilKick));
  wand.rotation.set(
    wand.userData.baseRotation.x + sway - wandState.channel * 0.2,
    wand.userData.baseRotation.y + Math.sin(time * 1.1) * 0.02,
    wand.userData.baseRotation.z + Math.sin(time * 2.8) * 0.03
  );

  if (wand.userData.tip?.material) {
    wand.userData.tip.material.emissiveIntensity = 1.2 + wandState.channel * 1.4;
  }
}

function updateLightning(delta) {
  if (!spellInput.lightning || !wand.userData.tip) {
    lightningBeam.glowLine.visible = false;
    lightningBeam.impact.visible = false;
    lightningBeam.impactLight.visible = false;
    return;
  }

  const origin = tempVec;
  const target = lightningBeam.target;
  wand.userData.tip.getWorldPosition(origin);

  const hit = getSpellHit(wand, camera, raycaster, spellTargets, tempVec, tempVec2);
  if (hit) {
    target.copy(hit.point);
  } else {
    camera.getWorldDirection(tempVec2);
    target.copy(origin).addScaledVector(tempVec2, 50);
  }

  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const dz = target.z - origin.z;
  const length = Math.max(0.01, Math.sqrt(dx * dx + dy * dy + dz * dz));

  tempVec2.set(dx / length, dy / length, dz / length);
  const upSeed = Math.abs(tempVec2.y) > 0.9 ? tempVec3.set(1, 0, 0) : tempVec3.set(0, 1, 0);
  const side = tempVec4.crossVectors(tempVec2, upSeed).normalize();
  const up = tempVec3.crossVectors(side, tempVec2).normalize();

  const positions = lightningBeam.positions;
  const segments = lightningBeam.segments;
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const jitterScale = 0.35 * (1 - Math.abs(0.5 - t) * 2);
    const jitterSide = (Math.random() - 0.5) * jitterScale;
    const jitterUp = (Math.random() - 0.5) * jitterScale;
    const idx = i * 3;
    positions[idx] = origin.x + dx * t + side.x * jitterSide + up.x * jitterUp;
    positions[idx + 1] = origin.y + dy * t + side.y * jitterSide + up.y * jitterUp;
    positions[idx + 2] = origin.z + dz * t + side.z * jitterSide + up.z * jitterUp;
  }

  const flicker = 0.6 + Math.random() * 0.4;
  lightningBeam.glowLine.geometry.setPositions(positions);
  lightningBeam.glowLine.material.opacity = (0.4 + wandState.channel * 0.5) * flicker;
  lightningBeam.glowLine.visible = true;

  if (hit) {
    const impactPositions = lightningBeam.impact.geometry.attributes.position.array;
    const planeNormal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    const impactSeed = Math.abs(planeNormal.y) > 0.9 ? tempVec4.set(1, 0, 0) : tempVec4.set(0, 1, 0);
    const axisA = tempVec3.crossVectors(planeNormal, impactSeed).normalize();
    const axisB = tempVec4.crossVectors(planeNormal, axisA).normalize();
    for (let i = 0; i < impactPositions.length; i += 3) {
      const r1 = (Math.random() - 0.5) * 0.5;
      const r2 = (Math.random() - 0.5) * 0.5;
      impactPositions[i] = hit.point.x + axisA.x * r1 + axisB.x * r2 + planeNormal.x * 0.03;
      impactPositions[i + 1] = hit.point.y + axisA.y * r1 + axisB.y * r2 + planeNormal.y * 0.03;
      impactPositions[i + 2] = hit.point.z + axisA.z * r1 + axisB.z * r2 + planeNormal.z * 0.03;
    }
    lightningBeam.impact.geometry.attributes.position.needsUpdate = true;
    lightningBeam.impact.material.opacity = 0.7 + Math.random() * 0.3;
    lightningBeam.impact.visible = true;
    lightningBeam.impactLight.position.copy(hit.point).addScaledVector(planeNormal, 0.1);
    lightningBeam.impactLight.intensity = 1.2 + Math.random() * 0.6;
    lightningBeam.impactLight.visible = true;
  } else {
    lightningBeam.impact.visible = false;
    lightningBeam.impactLight.visible = false;
  }

  if (wand.userData.tip?.material) {
    wand.userData.tip.material.emissiveIntensity = 1.2 + wandState.channel * 2 + Math.random() * 0.6;
  }
}

function updateEffects(delta) {
  for (let i = effects.length - 1; i >= 0; i -= 1) {
    const effect = effects[i];
    effect.age += delta;
    if (effect.type === "explosion") {
      const scale = 1 + effect.age * 3;
      effect.mesh.scale.setScalar(scale);
      effect.mesh.material.opacity = Math.max(0, 1 - effect.age / effect.maxAge);
      effect.light.intensity = Math.max(0, 1.4 - effect.age * 1.8);
    }

    if (effect.age >= effect.maxAge) {
      scene.remove(effect.points || effect.mesh);
      if (effect.points) {
        effect.points.geometry.dispose();
        effect.points.material.dispose();
      }
      if (effect.mesh) {
        effect.mesh.geometry.dispose();
        effect.mesh.material.dispose();
      }
      if (effect.light) {
        scene.remove(effect.light);
      }
      effects.splice(i, 1);
    }
  }
}

// ===== ANIMATION LOOP =====

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = clock.elapsedTime;

  if (controls.isLocked) {
    // Horizontal movement
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    const desiredX = Number(move.right) - Number(move.left);
    const desiredZ = Number(move.forward) - Number(move.backward);
    direction.x = desiredX;
    direction.z = desiredZ;
    direction.normalize();

    const speed = 50.0;
    if (move.forward || move.backward) velocity.z -= direction.z * speed * delta;
    if (move.left || move.right) velocity.x -= direction.x * speed * delta;

    // Get current position
    const playerPosition = controls.getObject().position;

    // Calculate intended new position
    const intendedPosition = new THREE.Vector3(
      playerPosition.x,
      playerPosition.y,
      playerPosition.z
    );

    // Apply movement to intended position
    const moveVector = new THREE.Vector3();
    camera.getWorldDirection(moveVector);
    const rightVector = new THREE.Vector3();
    rightVector.crossVectors(camera.up, moveVector).normalize();

    intendedPosition.addScaledVector(rightVector, -velocity.x * delta);
    intendedPosition.addScaledVector(moveVector, -velocity.z * delta);

    // Check for collision at intended position
    if (!checkCollision(intendedPosition, 0.5)) {
      // No collision, apply movement
      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);
    } else {
      // Collision detected, stop horizontal velocity
      velocity.x = 0;
      velocity.z = 0;
    }

    // Vertical movement (jumping and gravity)

    // Apply gravity
    velocity.y += GRAVITY * delta;

    // Update vertical position
    playerPosition.y += velocity.y * delta;

    // Ground collision detection
    const groundLevel = GROUND_HEIGHT + EYE_HEIGHT;
    if (playerPosition.y <= groundLevel) {
      playerPosition.y = groundLevel;
      velocity.y = 0;
      isOnGround = true;
      canJump = true;
    } else {
      isOnGround = false;
    }
  }

  // Update current room
  const currentRoom = rooms[currentRoomIndex];
  if (currentRoom && currentRoom.update) {
    currentRoom.update(time, delta);
  }

  updateWand(time, delta);
  updateLightning(delta);
  updateEffects(delta);

  renderer.render(scene, camera);
}

animate();

// ===== WINDOW RESIZE =====

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  lightningBeam.glowLine.material.resolution.set(window.innerWidth, window.innerHeight);
});
