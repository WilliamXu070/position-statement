import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

const ROOM_HEIGHT = 7;
const EYE_HEIGHT = 1.6;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0f0f);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const audioLoader = new THREE.AudioLoader();
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

const policeTexture = textureLoader.load("police.png");
policeTexture.colorSpace = THREE.SRGBColorSpace;
policeTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
let policeSirenBuffer = null;
audioLoader.load("police-siren-sound-effect-240674.mp3", (buffer) => {
  policeSirenBuffer = buffer;
  if (policeState.active) {
    startPoliceSiren();
  }
});

const controls = new PointerLockControls(camera, document.body);
const startButton = document.getElementById("start");
const overlay = document.getElementById("overlay");
const prompt = document.getElementById("prompt");
const roomLabel = document.getElementById("room-label");
const jailOverlay = document.getElementById("jail");
const restartButton = document.getElementById("restart");
const jailMessage = document.getElementById("jail-message");
const pitchObject = controls.getObject().children[0] ?? controls.getObject();
const rollGroup = new THREE.Group();
pitchObject.remove(camera);
rollGroup.add(camera);
pitchObject.add(rollGroup);

startButton.addEventListener("click", () => {
  controls.lock();
});

restartButton.addEventListener("click", () => {
  jailOverlay.classList.add("hidden");
  drunkState.active = false;
  drunkState.time = 0;
  rollGroup.rotation.set(0, 0, 0);
  camera.fov = baseFov;
  camera.updateProjectionMatrix();
  renderer.domElement.style.filter = "";
  beerState.active = false;
  beerState.mesh.visible = false;
  stopPoliceSiren();
  if (policeState.mesh) {
    scene.remove(policeState.mesh);
    if (policeState.mesh.material) {
      policeState.mesh.material.dispose();
    }
  }
  policeState.active = false;
  policeState.mesh = null;
  hallucinations.forEach((hall) => {
    scene.remove(hall.mesh);
    hall.mesh.geometry.dispose();
    hall.mesh.material.dispose();
  });
  hallucinations.length = 0;
  teleportToRoom("main");
  controls.lock();
});

controls.addEventListener("lock", () => {
  overlay.style.display = "none";
  jailOverlay.classList.add("hidden");
});

controls.addEventListener("unlock", () => {
  if (jailOverlay.classList.contains("hidden")) {
    overlay.style.display = "grid";
  }
});

camera.position.set(0, EYE_HEIGHT, 0);
scene.add(controls.getObject());

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const spotlight = new THREE.SpotLight(0xfff0df, 0.9, 120, Math.PI / 5, 0.5);
spotlight.position.set(12, 16, 8);
scene.add(spotlight);

const wand = createWand();
camera.add(wand);

const beer = createBeerSprite();
camera.add(beer);

const beerState = {
  mesh: beer,
  active: false,
  progress: 0,
  direction: 1,
};

const drunkState = {
  time: 0,
  duration: 6,
  active: false,
};
const drunkMove = new THREE.Vector2();

const baseFov = camera.fov;

const lightningBeam = createLightningBeam();
scene.add(lightningBeam.glowLine);
scene.add(lightningBeam.impact);
scene.add(lightningBeam.impactLight);

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

const rooms = new Map();
const doors = [];
const spellTargets = [];
const effects = [];
const bombs = [];
const hallucinations = [];
const spellInput = {
  lightning: false,
};
const policeState = {
  active: false,
  mesh: null,
  speed: 2.4,
  sound: null,
};
const wandState = {
  channel: 0,
  throwTime: 0,
  throwActive: false,
  recoil: 0,
};
let currentRoomId = "main";
let activeDoor = null;
const raycaster = new THREE.Raycaster();
const wandBob = new THREE.Vector3();
const lastSpellTime = new Map();

const SPELL_COOLDOWNS = new Map([
  ["Digit2", 800],
  ["Digit3", 400],
  ["Digit4", 1200],
]);

function createTextPanel({ title, body, width = 6, height = 3.4 }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f3efe7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1f1c17";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  let y = 40;
  const padding = 60;

  if (title) {
    ctx.font = "700 46px Georgia";
    y = drawWrappedText(ctx, title, padding, y, 900, 52);
    y += 12;
  }

  ctx.font = "28px Georgia";
  body.forEach((paragraph) => {
    y = drawWrappedText(ctx, paragraph, padding, y, 900, 38);
    y += 16;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const geometry = new THREE.PlaneGeometry(width, height);
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;

  words.forEach((word) => {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== "") {
      ctx.fillText(line, x, cursorY);
      line = word + " ";
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line.trim() !== "") {
    ctx.fillText(line, x, cursorY);
    cursorY += lineHeight;
  }

  return cursorY;
}

function createRoom({
  id,
  label,
  center,
  size,
  panels = [],
  doorSpecs = [],
}) {
  const group = new THREE.Group();
  group.position.copy(center);

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8d2c7,
    roughness: 0.9,
  });
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x7a6f60,
    roughness: 1,
  });
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0xe5dfd4,
    roughness: 0.9,
  });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(size.w, size.d),
    floorMaterial
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  group.add(floor);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(size.w, size.d),
    ceilingMaterial
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM_HEIGHT;
  group.add(ceiling);

  const wallGeometry = new THREE.PlaneGeometry(size.w, ROOM_HEIGHT);
  const wallGeometrySide = new THREE.PlaneGeometry(size.d, ROOM_HEIGHT);

  const wallNorth = new THREE.Mesh(wallGeometry, wallMaterial);
  wallNorth.position.set(0, ROOM_HEIGHT / 2, -size.d / 2);
  wallNorth.userData.roomId = id;
  group.add(wallNorth);
  spellTargets.push(wallNorth);

  const wallSouth = new THREE.Mesh(wallGeometry, wallMaterial);
  wallSouth.position.set(0, ROOM_HEIGHT / 2, size.d / 2);
  wallSouth.rotation.y = Math.PI;
  wallSouth.userData.roomId = id;
  group.add(wallSouth);
  spellTargets.push(wallSouth);

  const wallEast = new THREE.Mesh(wallGeometrySide, wallMaterial);
  wallEast.position.set(size.w / 2, ROOM_HEIGHT / 2, 0);
  wallEast.rotation.y = -Math.PI / 2;
  wallEast.userData.roomId = id;
  group.add(wallEast);
  spellTargets.push(wallEast);

  const wallWest = new THREE.Mesh(wallGeometrySide, wallMaterial);
  wallWest.position.set(-size.w / 2, ROOM_HEIGHT / 2, 0);
  wallWest.rotation.y = Math.PI / 2;
  wallWest.userData.roomId = id;
  group.add(wallWest);
  spellTargets.push(wallWest);

  panels.forEach((panel) => {
    const mesh = createTextPanel(panel);
    mesh.position.copy(panel.position).sub(center);
    mesh.rotation.y = panel.rotationY;
    group.add(mesh);
  });

  doorSpecs.forEach((doorSpec) => {
    const door = createDoor({
      ...doorSpec,
      position: doorSpec.position.clone().sub(center),
    });
    group.add(door);
    doors.push(door);
  });

  scene.add(group);

  const bounds = {
    minX: center.x - size.w / 2 + 0.8,
    maxX: center.x + size.w / 2 - 0.8,
    minZ: center.z - size.d / 2 + 0.8,
    maxZ: center.z + size.d / 2 - 0.8,
  };

  rooms.set(id, {
    id,
    label,
    bounds,
    spawn: new THREE.Vector3(center.x, EYE_HEIGHT, center.z + 2),
  });
}

function createDoor({ position, rotationY, targetRoomId, roomId, label }) {
  const group = new THREE.Group();
  const doorGeometry = new THREE.BoxGeometry(1.4, 3, 0.2);
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x603828,
    roughness: 0.7,
    side: THREE.DoubleSide,
    emissive: 0x20120b,
    emissiveIntensity: 0.6,
  });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 0, 0.12);
  door.rotation.y = 0;
  group.position.copy(position);
  group.rotation.y = rotationY;
  group.userData = {
    targetRoomId,
    roomId,
  };

  const signFront = createTextPanel({
    title: label,
    body: ["Press E to enter"],
    width: 2.8,
    height: 1.2,
  });
  signFront.position.set(0, 2.2, 0.15);
  signFront.rotation.y = 0;

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 3.15, 0.12),
    new THREE.MeshStandardMaterial({
      color: 0x8a5a3f,
      roughness: 0.6,
      emissive: 0x2a1a12,
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide,
    })
  );
  frame.position.set(0, 0, 0.06);

  group.add(frame);
  group.add(door);
  group.add(signFront);

  const signBack = createTextPanel({
    title: label,
    body: ["Press E to enter"],
    width: 2.8,
    height: 1.2,
  });
  signBack.position.set(0, 2.2, -0.15);
  signBack.rotation.y = Math.PI;
  group.add(signBack);
  return group;
}

function createWand() {
  const group = new THREE.Group();
  const handleMaterial = new THREE.MeshStandardMaterial({
    color: 0x3f2a1d,
    roughness: 0.8,
  });
  const tipMaterial = new THREE.MeshStandardMaterial({
    color: 0x6fd3ff,
    emissive: 0x1b6d9a,
    emissiveIntensity: 1.2,
  });

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.03, 0.45, 12),
    handleMaterial
  );
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0.05, -0.04, -0.22);
  group.add(handle);

  const grip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.08, 12),
    handleMaterial
  );
  grip.rotation.z = Math.PI / 2;
  grip.position.set(-0.17, -0.04, -0.22);
  group.add(grip);

  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), tipMaterial);
  tip.position.set(0.28, -0.04, -0.22);
  group.add(tip);

  group.userData.tip = tip;
  group.position.set(0.32, -0.25, -0.55);
  group.rotation.set(-0.2, 0.2, 0.1);
  group.userData.basePosition = group.position.clone();
  group.userData.baseRotation = group.rotation.clone();
  return group;
}

function createBeerSprite() {
  const texture = textureLoader.load("fireball.png");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.38), material);
  mesh.position.set(0.28, -0.33, -0.55);
  mesh.rotation.y = -0.1;
  mesh.visible = false;
  return mesh;
}

function createLightningBeam() {
  const segments = 18;
  const positions = new Float32Array((segments + 1) * 3);
  const geometry = new LineGeometry();
  geometry.setPositions(positions);

  const glowMaterial = new LineMaterial({
    color: 0x7be4ff,
    linewidth: 6,
    transparent: true,
    opacity: 0.5,
  });
  glowMaterial.resolution.set(window.innerWidth, window.innerHeight);
  const glowLine = new Line2(geometry, glowMaterial);
  glowLine.visible = false;

  const impactPositions = new Float32Array(24 * 3);
  const impactGeometry = new THREE.BufferGeometry();
  impactGeometry.setAttribute("position", new THREE.BufferAttribute(impactPositions, 3));
  const impactMaterial = new THREE.PointsMaterial({
    color: 0x9ae7ff,
    size: 0.09,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const impact = new THREE.Points(impactGeometry, impactMaterial);
  impact.visible = false;

  const impactLight = new THREE.PointLight(0x7be4ff, 0.0, 6);
  impactLight.visible = false;

  return {
    glowLine,
    impact,
    impactLight,
    positions,
    segments,
    progress: 0,
    target: new THREE.Vector3(),
  };
}

function createPolice() {
  const material = new THREE.SpriteMaterial({
    map: policeTexture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.2, 1.8, 1);
  return sprite;
}

function startPoliceSiren() {
  if (!policeState.sound) {
    policeState.sound = new THREE.Audio(audioListener);
  }
  if (policeSirenBuffer) {
    policeState.sound.setBuffer(policeSirenBuffer);
    policeState.sound.setLoop(true);
    policeState.sound.setVolume(0.5);
    if (!policeState.sound.isPlaying) {
      policeState.sound.play();
    }
  }
}

function stopPoliceSiren() {
  if (policeState.sound?.isPlaying) {
    policeState.sound.stop();
  }
}

function positionPoliceNearDoor(roomId) {
  if (!policeState.mesh) {
    return;
  }
  const candidates = doors.filter((door) => door.userData.roomId === roomId);
  const forward = tempVec.set(0, 0, -1).applyQuaternion(camera.quaternion);
  const inFront = candidates.filter((door) => {
    door.getWorldPosition(tempVec2);
    tempVec3.copy(tempVec2).sub(camera.position).normalize();
    return tempVec3.dot(forward) > 0.3;
  });
  const pool = inFront.length ? inFront : candidates;
  if (pool.length) {
    const door = pool[Math.floor(Math.random() * pool.length)];
    door.getWorldPosition(tempVec2);
    policeState.mesh.position.copy(tempVec2).setY(0);
  } else {
    policeState.mesh.position
      .copy(camera.position)
      .addScaledVector(forward, 4)
      .setY(0);
  }
}

function spawnPolice() {
  if (policeState.active) {
    return;
  }
  const police = createPolice();
  scene.add(police);

  policeState.active = true;
  policeState.mesh = police;
  positionPoliceNearDoor(currentRoomId);
  startPoliceSiren();
}

function triggerJail(message = "Note: don't drink when marking my assignment...") {
  jailOverlay.classList.remove("hidden");
  overlay.style.display = "none";
  jailMessage.textContent = message;
  controls.unlock();
  stopPoliceSiren();
  if (policeState.mesh) {
    scene.remove(policeState.mesh);
    if (policeState.mesh.material) {
      policeState.mesh.material.dispose();
    }
  }
  policeState.active = false;
  policeState.mesh = null;
}

function spawnHallucination(intensity) {
  const material = new THREE.MeshStandardMaterial({
    color: 0x86d7ff,
    emissive: 0x3aa4ff,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), material);
  mesh.position.set(
    camera.position.x + (Math.random() - 0.5) * 6,
    camera.position.y + (Math.random() * 2),
    camera.position.z + (Math.random() - 0.5) * 6
  );
  mesh.rotation.y = Math.random() * Math.PI * 2;
  scene.add(mesh);

  hallucinations.push({
    mesh,
    age: 0,
    maxAge: 0.8 + Math.random() * 0.6,
    spin: (Math.random() - 0.5) * 2,
    float: 0.2 + Math.random() * 0.2,
    intensity,
  });
}

function getSpellHit() {
  if (!wand.userData.tip) {
    return null;
  }
  const origin = tempVec;
  const dir = tempVec2;
  wand.userData.tip.getWorldPosition(origin);
  camera.getWorldDirection(dir);
  raycaster.set(origin, dir);
  raycaster.far = 30;
  const hits = raycaster.intersectObjects(spellTargets, false);
  return hits.find((hit) => hit.object.userData.roomId === currentRoomId) || null;
}

function canCastSpell(code) {
  const cooldown = SPELL_COOLDOWNS.get(code) ?? 0;
  const last = lastSpellTime.get(code) ?? 0;
  const now = performance.now();
  if (now - last < cooldown) {
    return false;
  }
  lastSpellTime.set(code, now);
  return true;
}

function spawnExplosion(position) {
  const explosion = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 18, 18),
    new THREE.MeshStandardMaterial({
      color: 0xff7a3a,
      emissive: 0xff4a1a,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.9,
    })
  );
  explosion.position.copy(position);
  scene.add(explosion);

  const light = new THREE.PointLight(0xff9c5a, 1.4, 6);
  light.position.copy(position);
  scene.add(light);

  effects.push({
    type: "explosion",
    mesh: explosion,
    light,
    age: 0,
    maxAge: 0.8,
  });
}

function spawnBomb() {
  const bomb = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.6,
      metalness: 0.2,
      emissive: 0x1a0000,
      emissiveIntensity: 0.6,
    })
  );
  wand.userData.tip.getWorldPosition(bomb.position);
  scene.add(bomb);

  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  dir.multiplyScalar(12);
  dir.y += 2;

  bombs.push({
    mesh: bomb,
    velocity: dir,
    timer: 0,
    roomId: currentRoomId,
    radius: 0.12,
  });
}

function spawnMark() {
  const hit = getSpellHit();
  if (!hit) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffb84d";
  ctx.font = "bold 160px Georgia";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("4+", canvas.width / 2, canvas.height / 2 + 10);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 0.7,
    emissive: 0x332200,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), material);
  mesh.position.copy(hit.point);
  const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  mesh.position.addScaledVector(normal, 0.04);
  mesh.lookAt(hit.point.clone().add(normal));
  scene.add(mesh);
}

function drinkBeer() {
  if (beerState.active) {
    return;
  }
  beerState.active = true;
  beerState.progress = 0;
  beerState.direction = 1;
  beerState.mesh.visible = true;
  drunkState.time = drunkState.duration;
  drunkState.active = true;
  spawnPolice();
}

function setupRooms() {
  createRoom({
    id: "main",
    label: "Main Room | Start",
    center: new THREE.Vector3(0, 0, 0),
    size: { w: 18, d: 18 },
    panels: [
      {
        title: "Enacting change, one dent at a time",
        body: [
          "This space is a story you walk through. Each room holds a section of my position statement.",
          "The goal is clarity: one idea per wall, one step per door.",
        ],
        position: new THREE.Vector3(0, 3.6, -7.6),
        rotationY: 0,
      },
      {
        title: "How to move",
        body: [
          "Use WASD to move and your mouse to look.",
          "Walk up to a door and press E to enter.",
          "Each room has a door back to this main room.",
        ],
        position: new THREE.Vector3(-7.6, 3.4, 0),
        rotationY: Math.PI / 2,
      },
    ],
    doorSpecs: [
      {
        position: new THREE.Vector3(0, 1.5, 8.6),
        rotationY: Math.PI,
        targetRoomId: "opening",
        roomId: "main",
        label: "Begin | Opening",
      },
    ],
  });

  createRoom({
    id: "opening",
    label: "Opening | Who I am + Design stance",
    center: new THREE.Vector3(0, 0, -30),
    size: { w: 18, d: 18 },
    panels: [
      {
        title: "Who I am",
        body: [
          "I am an Engineering Science student who treats engineering as a tool for practical change.",
          "I am most motivated when what I build connects directly to people, decisions, or systems.",
        ],
        position: new THREE.Vector3(0, 3.6, -37.6),
        rotationY: 0,
      },
      {
        title: "How I see engineering design",
        body: [
          "Design is intentional problem shaping.",
          "Before solving, I define real constraints, identify who is affected, and clarify what success means.",
          "Progress matters more than perfection. Small, deliberate improvements compound over time.",
        ],
        position: new THREE.Vector3(7.6, 3.4, -30),
        rotationY: -Math.PI / 2,
      },
    ],
    doorSpecs: [
      {
        position: new THREE.Vector3(0, 1.5, -21.4),
        rotationY: 0,
        targetRoomId: "experience-1",
        roomId: "opening",
        label: "Continue | Experience 1",
      },
      {
        position: new THREE.Vector3(-8.6, 1.5, -30),
        rotationY: Math.PI / 2,
        targetRoomId: "main",
        roomId: "opening",
        label: "Return | Main Room",
      },
    ],
  });

  createRoom({
    id: "experience-1",
    label: "Experience 1 | Usability reality check",
    center: new THREE.Vector3(0, 0, -60),
    size: { w: 18, d: 18 },
    panels: [
      {
        title: "What happened",
        body: [
          "I worked on a design that was technically correct but hard for users to apply.",
          "The system worked on paper, yet real users struggled to use it correctly.",
        ],
        position: new THREE.Vector3(-7.6, 3.5, -60),
        rotationY: Math.PI / 2,
      },
      {
        title: "What I learned",
        body: [
          "Technical correctness does not guarantee usability.",
          "A solution can fail if it ignores how people interpret and act.",
          "Communication is part of design, not an afterthought.",
        ],
        position: new THREE.Vector3(0, 3.5, -67.6),
        rotationY: 0,
      },
      {
        title: "How it changed my approach",
        body: [
          "I now design for clarity and real-world use.",
          "I prioritize simpler interfaces, clear explanations, and early user feedback.",
          "Small usability changes can create large practical impact.",
        ],
        position: new THREE.Vector3(7.6, 3.5, -60),
        rotationY: -Math.PI / 2,
      },
    ],
    doorSpecs: [
      {
        position: new THREE.Vector3(0, 1.5, -51.4),
        rotationY: 0,
        targetRoomId: "experience-2",
        roomId: "experience-1",
        label: "Continue | Experience 2",
      },
      {
        position: new THREE.Vector3(-8.6, 1.5, -60),
        rotationY: Math.PI / 2,
        targetRoomId: "main",
        roomId: "experience-1",
        label: "Return | Main Room",
      },
    ],
  });

  createRoom({
    id: "experience-2",
    label: "Experience 2 | Failure as data",
    center: new THREE.Vector3(0, 0, -90),
    size: { w: 18, d: 18 },
    panels: [
      {
        title: "What happened",
        body: [
          "During testing, our design failed because our assumptions did not match real conditions.",
          "Performance dropped, and we had to revise what we thought we knew.",
        ],
        position: new THREE.Vector3(0, 3.5, -97.6),
        rotationY: 0,
      },
      {
        title: "What I learned",
        body: [
          "Failure is not a setback; it is data.",
          "Early testing prevents larger problems later.",
          "Assumptions must be challenged repeatedly.",
        ],
        position: new THREE.Vector3(-7.6, 3.5, -90),
        rotationY: Math.PI / 2,
      },
      {
        title: "How it changed my approach",
        body: [
          "I prototype earlier, test more often, and treat feedback as a design input.",
          "Iteration is not a stage. It is the method.",
        ],
        position: new THREE.Vector3(7.6, 3.5, -90),
        rotationY: -Math.PI / 2,
      },
    ],
    doorSpecs: [
      {
        position: new THREE.Vector3(0, 1.5, -81.4),
        rotationY: 0,
        targetRoomId: "beliefs",
        roomId: "experience-2",
        label: "Continue | Beliefs + Values",
      },
      {
        position: new THREE.Vector3(-8.6, 1.5, -90),
        rotationY: Math.PI / 2,
        targetRoomId: "main",
        roomId: "experience-2",
        label: "Return | Main Room",
      },
    ],
  });

  createRoom({
    id: "beliefs",
    label: "Beliefs + Values",
    center: new THREE.Vector3(0, 0, -120),
    size: { w: 18, d: 18 },
    panels: [
      {
        title: "What I believe about design",
        body: [
          "Design should serve real needs, consider human experience, and adapt to uncertainty.",
          "Design is not only about building systems. It is about shaping outcomes.",
          "People interact with designs, not equations. Context matters as much as calculations.",
        ],
        position: new THREE.Vector3(0, 3.4, -127.6),
        rotationY: 0,
      },
      {
        title: "My values",
        body: [
          "Curiosity, responsibility, and impact drive my decisions.",
          "These values show up in how I ask questions before designing, test assumptions, and choose clarity over complexity.",
          "I measure success by usefulness and understanding, not by novelty alone.",
        ],
        position: new THREE.Vector3(7.6, 3.4, -120),
        rotationY: -Math.PI / 2,
      },
    ],
    doorSpecs: [
      {
        position: new THREE.Vector3(0, 1.5, -111.4),
        rotationY: 0,
        targetRoomId: "reflection",
        roomId: "beliefs",
        label: "Continue | Reflection",
      },
      {
        position: new THREE.Vector3(-8.6, 1.5, -120),
        rotationY: Math.PI / 2,
        targetRoomId: "main",
        roomId: "beliefs",
        label: "Return | Main Room",
      },
    ],
  });

  createRoom({
    id: "reflection",
    label: "Reflection + Conclusion",
    center: new THREE.Vector3(0, 0, -150),
    size: { w: 18, d: 18 },
    panels: [
      {
        title: "Reflection",
        body: [
          "I am still learning how to balance technical depth with accessibility.",
          "I want to improve how I communicate complex ideas and how I design with broader social impact in mind.",
          "I am working to translate ideas into action under real constraints.",
        ],
        position: new THREE.Vector3(-7.6, 3.4, -150),
        rotationY: Math.PI / 2,
      },
      {
        title: "Conclusion",
        body: [
          "My direction as an engineer is deliberate, continuous improvement.",
          "I do not aim to change everything at once. I aim to make small dents that add up to meaningful progress.",
          "Real change happens one thoughtful decision at a time.",
        ],
        position: new THREE.Vector3(0, 3.4, -157.6),
        rotationY: 0,
      },
    ],
    doorSpecs: [
      {
        position: new THREE.Vector3(0, 1.5, -141.4),
        rotationY: 0,
        targetRoomId: "main",
        roomId: "reflection",
        label: "Return | Main Room",
      },
    ],
  });
}

setupRooms();

function updateActiveDoor() {
  activeDoor = null;
  let closestDistance = Infinity;

  doors.forEach((door) => {
    if (door.userData.roomId !== currentRoomId) {
      return;
    }
    door.getWorldPosition(tempVec);
    const distance = camera.position.distanceTo(tempVec);
    if (distance < 2.2 && distance < closestDistance) {
      closestDistance = distance;
      activeDoor = door;
    }
  });

  prompt.classList.toggle("hidden", !activeDoor);
}

function teleportToRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) {
    return;
  }
  currentRoomId = roomId;
  const spawn = room.spawn.clone();
  controls.getObject().position.copy(spawn);
  velocity.set(0, 0, 0);
  roomLabel.textContent = room.label;
  if (policeState.active) {
    positionPoliceNearDoor(roomId);
  }
}

teleportToRoom("main");

const onKeyDown = (event) => {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      move.forward = true;
      break;
    case "ArrowLeft":
    case "KeyA":
      move.left = true;
      break;
    case "ArrowDown":
    case "KeyS":
      move.backward = true;
      break;
    case "ArrowRight":
    case "KeyD":
      move.right = true;
      break;
    case "KeyE":
      if (activeDoor) {
        teleportToRoom(activeDoor.userData.targetRoomId);
      }
      break;
    case "Digit1":
      spellInput.lightning = true;
      break;
    case "Digit2":
      if (canCastSpell(event.code)) {
        spawnBomb();
        wandState.throwTime = 0;
        wandState.throwActive = true;
        wandState.recoil = 1;
      }
      break;
    case "Digit3":
      if (canCastSpell(event.code)) {
        spawnMark();
        wandState.recoil = 1;
      }
      break;
    case "Digit4":
      if (canCastSpell(event.code)) {
        drinkBeer();
        wandState.recoil = 1;
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

function clampToRoom() {
  const room = rooms.get(currentRoomId);
  if (!room) {
    return;
  }
  const position = controls.getObject().position;
  position.x = Math.min(room.bounds.maxX, Math.max(room.bounds.minX, position.x));
  position.z = Math.min(room.bounds.maxZ, Math.max(room.bounds.minZ, position.z));
  position.y = EYE_HEIGHT;
}

function updateWand(time, delta) {
  if (!wand.userData.basePosition || !wand.userData.baseRotation) {
    return;
  }
  const channelTarget = spellInput.lightning ? 1 : 0;
  wandState.channel += (channelTarget - wandState.channel) * Math.min(1, delta * 6);

  if (wandState.throwActive) {
    wandState.throwTime += delta;
    if (wandState.throwTime >= 0.45) {
      wandState.throwTime = 0;
      wandState.throwActive = false;
    }
  }

  wandState.recoil = Math.max(0, wandState.recoil - delta * 3);

  const bob = Math.sin(time * 2.2) * 0.015;
  const sway = Math.sin(time * 1.6) * 0.02;

  const throwProgress = wandState.throwActive
    ? Math.min(1, wandState.throwTime / 0.45)
    : 0;
  const throwEase = Math.sin(throwProgress * Math.PI);
  const channelKick = wandState.channel * 0.05;
  const recoilKick = wandState.recoil * 0.06;

  wand.position
    .copy(wand.userData.basePosition)
    .add(wandBob.set(0, bob + throwEase * 0.06, 0))
    .add(tempVec.set(0, 0, -channelKick - throwEase * 0.12 - recoilKick));
  wand.rotation.set(
    wand.userData.baseRotation.x + sway - throwEase * 0.6 - wandState.channel * 0.2,
    wand.userData.baseRotation.y + Math.sin(time * 1.1) * 0.02,
    wand.userData.baseRotation.z + Math.sin(time * 2.8) * 0.03 + throwEase * 0.2
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

  const hit = getSpellHit();
  if (hit) {
    target.copy(hit.point);
  } else {
    camera.getWorldDirection(tempVec2);
    target.copy(origin).addScaledVector(tempVec2, 12);
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

function updateHallucinations(delta) {
  for (let i = hallucinations.length - 1; i >= 0; i -= 1) {
    const hall = hallucinations[i];
    hall.age += delta;
    hall.mesh.position.y += hall.float * delta;
    hall.mesh.rotation.y += hall.spin * delta;
    hall.mesh.material.opacity = Math.max(
      0,
      (1 - hall.age / hall.maxAge) * 0.6 * hall.intensity
    );
    if (hall.age >= hall.maxAge) {
      scene.remove(hall.mesh);
      hall.mesh.geometry.dispose();
      hall.mesh.material.dispose();
      hallucinations.splice(i, 1);
    }
  }
}

function updateBombs(delta) {
  for (let i = bombs.length - 1; i >= 0; i -= 1) {
    const bomb = bombs[i];
    bomb.timer += delta;
    bomb.velocity.y -= 9.8 * delta;
    bomb.mesh.position.addScaledVector(bomb.velocity, delta);

    const room = rooms.get(bomb.roomId);
    if (room) {
      const minX = room.bounds.minX + bomb.radius;
      const maxX = room.bounds.maxX - bomb.radius;
      const minZ = room.bounds.minZ + bomb.radius;
      const maxZ = room.bounds.maxZ - bomb.radius;

      if (bomb.mesh.position.x < minX) {
        bomb.mesh.position.x = minX;
        bomb.velocity.x = Math.abs(bomb.velocity.x) * 0.8;
      } else if (bomb.mesh.position.x > maxX) {
        bomb.mesh.position.x = maxX;
        bomb.velocity.x = -Math.abs(bomb.velocity.x) * 0.8;
      }

      if (bomb.mesh.position.z < minZ) {
        bomb.mesh.position.z = minZ;
        bomb.velocity.z = Math.abs(bomb.velocity.z) * 0.8;
      } else if (bomb.mesh.position.z > maxZ) {
        bomb.mesh.position.z = maxZ;
        bomb.velocity.z = -Math.abs(bomb.velocity.z) * 0.8;
      }
    }

    if (bomb.mesh.position.y <= 0.2 || bomb.timer > 2.4) {
      const explosionPosition = bomb.mesh.position.clone();
      spawnExplosion(explosionPosition);
      const distance = camera.position.distanceTo(explosionPosition);
      if (distance < 2.6) {
        triggerJail("dont throw bombs at yourself");
      }
      scene.remove(bomb.mesh);
      bomb.mesh.geometry.dispose();
      bomb.mesh.material.dispose();
      bombs.splice(i, 1);
    }
  }
}

function updateBeer(delta) {
  if (!beerState.active) {
    return;
  }
  beerState.progress += delta * beerState.direction * 1.8;
  if (beerState.progress >= 1) {
    beerState.progress = 1;
    beerState.direction = -1;
  }
  if (beerState.progress <= 0) {
    beerState.progress = 0;
    beerState.active = false;
    beerState.mesh.visible = false;
  }

  const lift = 1 - Math.pow(1 - beerState.progress, 2);
  beerState.mesh.position.set(0.28 - lift * 0.08, -0.33 + lift * 0.26, -0.55 + lift * 0.22);
  beerState.mesh.rotation.set(lift * 0.7, -0.1, -lift * 0.18);
}

function updatePolice(delta) {
  if (!policeState.active || !policeState.mesh) {
    return;
  }
  const police = policeState.mesh;
  const target = tempVec2.copy(camera.position);
  target.y = 0;
  const toTarget = tempVec3.copy(target).sub(police.position);
  const distance = toTarget.length();
  if (distance < 1.1) {
    triggerJail();
    return;
  }
  toTarget.normalize();
  police.position.addScaledVector(toTarget, policeState.speed * delta);
}

function updateDrunkEffect(time, delta) {
  if (!drunkState.active) {
    return;
  }

  drunkState.time = Math.max(0, drunkState.time - delta);
  const intensity = drunkState.time / drunkState.duration;
  const sway = Math.sin(time * 4.2) * 0.16 * intensity;
  const wobble = Math.sin(time * 6.4 + 1.1) * 0.1 * intensity;
  const aimDrift = Math.sin(time * 3.4) * 0.05 * intensity;
  const aimNod = Math.sin(time * 5.1 + 0.6) * 0.04 * intensity;
  rollGroup.rotation.z = sway;
  rollGroup.rotation.y = aimDrift;
  rollGroup.rotation.x = aimNod;
  camera.fov = baseFov + wobble * 14;
  camera.updateProjectionMatrix();

  const blur = 0.6 + intensity * 1.2;
  const hue = intensity * 6;
  const ghost = 3 + intensity * 6;
  renderer.domElement.style.filter = `blur(${blur}px) saturate(${1.1 + intensity * 0.6}) contrast(${1 + intensity * 0.25}) hue-rotate(${hue}deg) drop-shadow(${ghost}px ${ghost}px 0 rgba(180,220,255,0.35))`;

  if (Math.random() < delta * 0.4 * intensity) {
    spawnHallucination(intensity);
  }

  if (drunkState.time <= 0) {
    drunkState.active = false;
    rollGroup.rotation.z = 0;
    rollGroup.rotation.y = 0;
    rollGroup.rotation.x = 0;
    camera.fov = baseFov;
    camera.updateProjectionMatrix();
    renderer.domElement.style.filter = "";
  }
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = clock.elapsedTime;

  if (controls.isLocked) {
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    const desiredX = Number(move.right) - Number(move.left);
    const desiredZ = Number(move.forward) - Number(move.backward);
    if (drunkState.active) {
      const intensity = drunkState.time / drunkState.duration;
      const lag = 0.06 + intensity * 0.06;
      drunkMove.x += (desiredX - drunkMove.x) * lag;
      drunkMove.y += (desiredZ - drunkMove.y) * lag;
      const drift = Math.sin(time * 2.2) * 0.25 * intensity;
      direction.x = drunkMove.x + drift;
      direction.z = drunkMove.y + Math.cos(time * 1.6) * 0.2 * intensity;
    } else {
      direction.x = desiredX;
      direction.z = desiredZ;
      drunkMove.set(0, 0);
    }
    direction.normalize();

    const speed = 50.0;
    if (move.forward || move.backward) velocity.z -= direction.z * speed * delta;
    if (move.left || move.right) velocity.x -= direction.x * speed * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    clampToRoom();
    updateActiveDoor();
  }

  updateWand(time, delta);
  updateLightning(delta);
  updateEffects(delta);
  updateBombs(delta);
  updateBeer(delta);
  updatePolice(delta);
  updateDrunkEffect(time, delta);
  updateHallucinations(delta);

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  lightningBeam.glowLine.material.resolution.set(window.innerWidth, window.innerHeight);
});
