import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
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

// === FIRST PRINCIPLES OVERLAY SYSTEM ===

const fpOverlay = document.getElementById("first-principles-overlay");
const fpImage = document.getElementById("fp-image");
const fpTitle = document.getElementById("fp-title");
const fpStepIndicator = document.getElementById("fp-step-indicator");
const fpProgressFill = document.getElementById("fp-progress-fill");
const fpPrevBtn = document.getElementById("fp-prev");
const fpNextBtn = document.getElementById("fp-next");

let fpCurrentStep = 0;
let fpOverlayActive = false;

const fpSteps = [
  { title: "Idea", image: "Images/1.jpg" },
  { title: "Background Research", image: "Images/2.png" },
  { title: "Optical System Development", image: "Images/3.jpg" },
  { title: "CAD Development", image: "Images/4.png" },
  { title: "Software Development", image: "Images/5.png" },
  { title: "Prototype Development", image: "Images/6.png" },
  { title: "Iteration", image: "Images/7.png" },
  { title: "Final Result", image: "Images/8.png" },
];

function updateFPDisplay() {
  const step = fpSteps[fpCurrentStep];
  fpImage.src = step.image;
  fpTitle.textContent = step.title;
  fpStepIndicator.textContent = `Step ${fpCurrentStep + 1} of ${fpSteps.length}`;

  // Update progress bar (percentage of completion)
  const progressPercent = ((fpCurrentStep + 1) / fpSteps.length) * 100;
  fpProgressFill.style.width = `${progressPercent}%`;

  // Update button states
  fpPrevBtn.disabled = fpCurrentStep === 0;
  fpNextBtn.disabled = fpCurrentStep === fpSteps.length - 1;
}

function showFPOverlay() {
  fpOverlayActive = true;
  fpCurrentStep = 0; // Reset to first step
  updateFPDisplay();
  fpOverlay.classList.remove("hidden");
  controls.unlock(); // Unlock pointer so user can click
  console.log('📊 Showing First Principles overlay');
}

function hideFPOverlay() {
  fpOverlayActive = false;
  fpOverlay.classList.add("hidden");
  console.log('📊 Hiding First Principles overlay');
}

// Navigation functions
function fpGoNext() {
  if (fpCurrentStep < fpSteps.length - 1) {
    fpCurrentStep++;
    updateFPDisplay();
  }
}

function fpGoPrev() {
  if (fpCurrentStep > 0) {
    fpCurrentStep--;
    updateFPDisplay();
  }
}

// Event listeners for First Principles overlay
fpNextBtn.addEventListener("click", fpGoNext);
fpPrevBtn.addEventListener("click", fpGoPrev);

// Function to check if looking at VIEW button and activate it
function checkViewButton() {
  if (!controls.isLocked) return;

  // Raycast from camera center to detect what we're looking at
  const viewRaycaster = new THREE.Raycaster();
  viewRaycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = viewRaycaster.intersectObjects(spellTargets, true);

  if (intersects.length > 0) {
    const lookedAtObject = intersects[0].object;

    // Check if looking at the VIEW button
    if (lookedAtObject.userData.isViewButton) {
      planktonVisible = true;
      planktonOverlay.classList.remove("hidden");
      console.log('🔬 Showing plankton view');
      return true;
    }

    // Check parent objects for the button flag
    let parent = lookedAtObject.parent;
    while (parent) {
      if (parent.userData && parent.userData.isViewButton) {
        planktonVisible = true;
        planktonOverlay.classList.remove("hidden");
        console.log('🔬 Showing plankton view (via parent)');
        return true;
      }
      parent = parent.parent;
    }
  }
  return false;
}

// Function to check if looking at code block and trigger organization
function checkCodeBlockInteraction() {
  if (!controls.isLocked) return;

  // Raycast from camera center to detect what we're looking at
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects(spellTargets, true);

  if (intersects.length > 0) {
    const lookedAtObject = intersects[0].object;

    // Check if looking at a code block
    if (lookedAtObject.userData.isCodeBlock) {
      // Trigger organization animation
      const currentRoom = rooms[currentRoomIndex];
      if (currentRoom && currentRoom.group.userData.organizeBlocks) {
        currentRoom.group.userData.organizeBlocks();
        console.log('📐 Triggered block organization');
        return true;
      }
    }
  }
  return false;
}

// Update interaction prompt based on what we're looking at
function updateInteractionPrompt() {
  if (!controls.isLocked) {
    prompt.classList.add("hidden");
    return;
  }

  // Raycast from camera center to detect what we're looking at
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects(spellTargets, true);

  if (intersects.length > 0) {
    const lookedAtObject = intersects[0].object;

    // Check if looking at a code block
    if (lookedAtObject.userData.isCodeBlock) {
      prompt.textContent = "Press E to toggle organization";
      prompt.classList.remove("hidden");
      return;
    }
  }

  // Hide prompt if not looking at anything interactable
  prompt.classList.add("hidden");
}

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

  // Pause audio when user presses Escape (but not for Room 3 overlay)
  if (!fpOverlayActive) {
    pauseRoomAudio();
  }
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
camera.layers.enable(0);
camera.layers.disable(1);
scene.add(controls.getObject());

// ===== SPELL SYSTEM =====

const wand = createWand();
camera.add(wand);
const wandTuning = {
  position: new THREE.Vector3(0.42, -0.25, -0.55),
  rotation: new THREE.Euler(-0.1, -Math.PI / 2 + 3.2, -0.05),
};
wand.position.copy(wandTuning.position);
wand.rotation.copy(wandTuning.rotation);
wand.userData.basePosition = wandTuning.position.clone();
wand.userData.baseRotation = wandTuning.rotation.clone();

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
const avatarState = {
  model: null,
  ready: false,
};

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

// ===== PLAYER AVATAR (STEVE) =====

const avatarLoader = new GLTFLoader();
avatarLoader.load(
  "models/minecraft_-_steve.glb",
  (gltf) => {
    avatarState.model = gltf.scene;
    avatarState.model.name = "player-avatar";
    avatarState.model.scale.set(0.08, 0.08, 0.08);
    avatarState.model.layers.set(1);
    avatarState.model.traverse((child) => {
      child.layers.set(1);
    });
    avatarState.model.visible = false;
    scene.add(avatarState.model);
    avatarState.ready = true;
    console.log("✅ Player avatar loaded");
  },
  undefined,
  (error) => {
    console.error("❌ Error loading player avatar:", error);
  }
);

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

  // Show/hide First Principles overlay for Room 3
  if (index === 2) { // Room 3 (0-indexed)
    showFPOverlay();
  } else if (fpOverlayActive) {
    hideFPOverlay();
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
      if (!fpOverlayActive) {
        move.forward = true;
      }
      break;
    case "ArrowLeft":
    case "KeyA":
      if (fpOverlayActive) {
        // Navigate slides when overlay is active
        fpGoPrev();
      } else {
        move.left = true;
      }
      break;
    case "ArrowDown":
    case "KeyS":
      if (event.code === "ArrowDown" && !move.backward) {
        // Navigate to previous room
        if (currentRoomIndex > 0) {
          teleportToRoom(currentRoomIndex - 1);
        }
      }
      if (!fpOverlayActive) {
        move.backward = true;
      }
      break;
    case "ArrowRight":
    case "KeyD":
      if (fpOverlayActive) {
        // Navigate slides when overlay is active
        fpGoNext();
      } else {
        move.right = true;
      }
      break;
    case "Digit1":
      spellInput.lightning = true;
      break;
    case "KeyH":
      returnToRoomCenter();
      break;
    case "KeyE":
      // Interact with objects
      if (!checkViewButton()) {
        // If not looking at VIEW button, check for code blocks (Room 4)
        checkCodeBlockInteraction();
      }
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
  const basePosition = wandTuning.position;
  const baseRotation = wandTuning.rotation;
  const channelTarget = spellInput.lightning ? 1 : 0;
  wandState.channel += (channelTarget - wandState.channel) * Math.min(1, delta * 6);
  wandState.recoil = Math.max(0, wandState.recoil - delta * 3);

  const bob = Math.sin(time * 2.2) * 0.015;
  const sway = Math.sin(time * 1.6) * 0.02;
  const channelKick = wandState.channel * 0.05;
  const recoilKick = wandState.recoil * 0.06;

  wand.position
    .copy(basePosition)
    .add(tempVec.set(0, bob, 0))
    .add(tempVec2.set(0, 0, -channelKick - recoilKick));
  wand.rotation.set(
    baseRotation.x + sway - wandState.channel * 0.2,
    baseRotation.y + Math.sin(time * 1.1) * 0.02,
    baseRotation.z + Math.sin(time * 2.8) * 0.03
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
    currentRoom.update(time, delta, camera);
  }

  if (avatarState.ready && avatarState.model) {
    const playerPosition = controls.getObject().position;
    avatarState.model.position.set(
      playerPosition.x,
      playerPosition.y - EYE_HEIGHT + 1.2,
      playerPosition.z
    );
    avatarState.model.rotation.y = controls.getObject().rotation.y + Math.PI;
    avatarState.model.visible = currentRoom?.id === "room6";
  }

  updateWand(time, delta);
  updateLightning(delta);
  updateEffects(delta);

  // Update interaction prompt based on what we're looking at
  updateInteractionPrompt();

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
