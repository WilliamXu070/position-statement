import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createTextPanel } from "../utils/textPanel.js";

// ROOM 6: Reflection & Growth
export function createRoom6(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -1000);

  // Calm, open room with warm lighting
  scene.background = new THREE.Color(0xf5f0e8);
  scene.fog = new THREE.Fog(0xf5f0e8, 15, 70);

  // Warm white floor with slight golden tint
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
      color: 0xfff8f0,
      roughness: 0.6,
      metalness: 0.3,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);
  spellTargets.push(platform);

  // Large mirror effect (reflective surface)
  const mirrorGeometry = new THREE.PlaneGeometry(8, 10);
  const mirrorMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.05,
    metalness: 0.98,
    envMapIntensity: 1.5,
  });
  const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
  mirror.position.set(0, 5, -12);
  mirror.userData.playerNear = false;
  group.add(mirror);
  spellTargets.push(mirror);

  // Mirror frame
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.3,
    metalness: 0.7,
  });

  const frameThickness = 0.3;
  const frameDepth = 0.5;

  const frameLeft = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, 10, frameDepth),
    frameMaterial
  );
  frameLeft.position.set(-4.15, 5, -12);
  group.add(frameLeft);

  const frameRight = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, 10, frameDepth),
    frameMaterial
  );
  frameRight.position.set(4.15, 5, -12);
  group.add(frameRight);

  const frameTop = new THREE.Mesh(
    new THREE.BoxGeometry(8.6, frameThickness, frameDepth),
    frameMaterial
  );
  frameTop.position.set(0, 10.15, -12);
  group.add(frameTop);

  const frameBottom = new THREE.Mesh(
    new THREE.BoxGeometry(8.6, frameThickness, frameDepth),
    frameMaterial
  );
  frameBottom.position.set(0, -0.15, -12);
  group.add(frameBottom);

  // Floating icons behind player (will reflect in mirror)
  const iconGroup = new THREE.Group();
  iconGroup.position.set(0, 3, 8);
  group.add(iconGroup);

  // Lightbulb (learning)
  const lightbulbGeometry = new THREE.SphereGeometry(0.6, 16, 16);
  const lightbulbMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff88,
    emissive: 0xffdd44,
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.2,
    transparent: true,
    opacity: 0.95,
  });
  const lightbulb = new THREE.Mesh(lightbulbGeometry, lightbulbMaterial);
  lightbulb.position.set(-3, 0, 0);
  lightbulb.userData.glowIntensity = 0.4;
  iconGroup.add(lightbulb);

  // Lightbulb stem
  const stemGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.8, 8);
  const stemMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.6,
    metalness: 0.5,
  });
  const stem = new THREE.Mesh(stemGeometry, stemMaterial);
  stem.position.set(-3, -0.8, 0);
  iconGroup.add(stem);

  // Compass (direction)
  const compassGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32);
  const compassMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.4,
    metalness: 0.3,
  });
  const compass = new THREE.Mesh(compassGeometry, compassMaterial);
  compass.position.set(0, 0, 0);
  compass.rotation.x = Math.PI / 2;
  iconGroup.add(compass);

  // Compass needle
  const needleGeometry = new THREE.ConeGeometry(0.15, 1.2, 4);
  const needleMaterial = new THREE.MeshStandardMaterial({
    color: 0xff3333,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.7,
  });
  const needle = new THREE.Mesh(needleGeometry, needleMaterial);
  needle.rotation.x = Math.PI / 2;
  needle.position.set(0, 0.2, 0);
  compass.add(needle);

  // Heart (values)
  const heartShape = new THREE.Shape();
  const x = 0, y = 0;
  heartShape.moveTo(x + 0.5, y + 0.5);
  heartShape.bezierCurveTo(x + 0.5, y + 0.3, x + 0.4, y, x, y);
  heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.35, x - 0.6, y + 0.35);
  heartShape.bezierCurveTo(x - 0.6, y + 0.55, x - 0.4, y + 0.77, x + 0.5, y + 1);
  heartShape.bezierCurveTo(x + 1.4, y + 0.77, x + 1.6, y + 0.55, x + 1.6, y + 0.35);
  heartShape.bezierCurveTo(x + 1.6, y + 0.35, x + 1.6, y, x + 1, y);
  heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.3, x + 0.5, y + 0.5);

  const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 3,
  });
  const heartMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6b6b,
    emissive: 0xff0000,
    emissiveIntensity: 0.3,
    roughness: 0.4,
    metalness: 0.2,
  });
  const heart = new THREE.Mesh(heartGeometry, heartMaterial);
  heart.position.set(3, 0, 0);
  heart.rotation.x = Math.PI;
  heart.scale.set(0.8, 0.8, 0.8);
  iconGroup.add(heart);

  // Icon labels (visible when player approaches)
  const learningLabel = createTextPanel({
    title: "Learning",
    body: [],
    width: 2,
    height: 0.8,
  });
  learningLabel.position.set(-3, -1.5, 0);
  learningLabel.material.transparent = true;
  learningLabel.material.opacity = 0;
  iconGroup.add(learningLabel);

  const directionLabel = createTextPanel({
    title: "Direction",
    body: [],
    width: 2,
    height: 0.8,
  });
  directionLabel.position.set(0, -1.5, 0);
  directionLabel.material.transparent = true;
  directionLabel.material.opacity = 0;
  iconGroup.add(directionLabel);

  const valuesLabel = createTextPanel({
    title: "Values",
    body: [],
    width: 2,
    height: 0.8,
  });
  valuesLabel.position.set(3, -1.5, 0);
  valuesLabel.material.transparent = true;
  valuesLabel.material.opacity = 0;
  iconGroup.add(valuesLabel);

  // Main description panel
  const descPanel = createTextPanel({
    title: "Reflection & Growth",
    body: [
      "Growth requires looking back to move forward.",
      "",
      "I reflect on what I've learned, the direction I'm heading,",
      "and the values that guide me.",
      "",
      "Approach the mirror to see yourself clearly.",
    ],
    width: 10,
    height: 5,
  });
  descPanel.position.set(0, 3.5, 10);
  group.add(descPanel);

  // Quote panel near mirror
  const quotePanel = createTextPanel({
    title: '"Know Thyself"',
    body: ["— Ancient Greek Aphorism"],
    width: 4,
    height: 2,
  });
  quotePanel.position.set(0, 8, -10);
  quotePanel.material = new THREE.MeshStandardMaterial({
    map: quotePanel.material.map,
    emissive: 0xd4af37,
    emissiveIntensity: 0.2,
    color: 0xffffff,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  group.add(quotePanel);

  // Warm, soft lighting
  const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.7);
  scene.add(ambientLight);

  const warmLight1 = new THREE.PointLight(0xffd699, 1.2, 30);
  warmLight1.position.set(-8, 6, -5);
  scene.add(warmLight1);

  const warmLight2 = new THREE.PointLight(0xffd699, 1.2, 30);
  warmLight2.position.set(8, 6, -5);
  scene.add(warmLight2);

  const topLight = new THREE.PointLight(0xffffff, 0.8, 25);
  topLight.position.set(0, 10, 0);
  scene.add(topLight);

  // Golden glow for icons
  const iconLight = new THREE.PointLight(0xffd699, 0, 15);
  iconLight.position.set(0, 3, 8);
  scene.add(iconLight);

  rooms.push({
    id: "room6",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -1000),
    update: (time, delta) => {
      // Rotate icons gently
      iconGroup.rotation.y = Math.sin(time * 0.3) * 0.15;

      // Float icons
      lightbulb.position.y = Math.sin(time * 1.5) * 0.2;
      compass.position.y = Math.sin(time * 1.5 + Math.PI / 3) * 0.2;
      heart.position.y = Math.sin(time * 1.5 + 2 * Math.PI / 3) * 0.2;

      // Rotate compass needle
      needle.rotation.z = time * 0.5;

      // Pulse heart
      const heartScale = 0.8 + Math.sin(time * 2) * 0.05;
      heart.scale.set(heartScale, heartScale, heartScale);

      // Pulse lightbulb glow
      const lightbulbGlow = 0.4 + Math.sin(time * 2.5) * 0.2;
      lightbulbMaterial.emissiveIntensity = lightbulbGlow;

      // Check player distance from mirror (world position)
      const mirrorWorldPos = new THREE.Vector3();
      mirror.getWorldPosition(mirrorWorldPos);

      // Player is at camera position (0, EYE_HEIGHT, room Z offset)
      const playerPos = new THREE.Vector3(0, EYE_HEIGHT, -1000);
      const distanceToMirror = playerPos.distanceTo(mirrorWorldPos);

      // If player approaches mirror (within 10 units)
      if (distanceToMirror < 10) {
        mirror.userData.playerNear = true;
      } else {
        mirror.userData.playerNear = false;
      }

      // When near mirror, add glowing outlines to icons
      if (mirror.userData.playerNear) {
        // Brighten icon emissives
        lightbulbMaterial.emissiveIntensity = Math.min(1.0, lightbulbMaterial.emissiveIntensity + delta * 1.5);
        needleMaterial.emissiveIntensity = Math.min(0.9, needleMaterial.emissiveIntensity + delta * 1.5);
        heartMaterial.emissiveIntensity = Math.min(0.8, heartMaterial.emissiveIntensity + delta * 1.5);

        // Fade in labels
        learningLabel.material.opacity = Math.min(1, learningLabel.material.opacity + delta * 2);
        directionLabel.material.opacity = Math.min(1, directionLabel.material.opacity + delta * 2);
        valuesLabel.material.opacity = Math.min(1, valuesLabel.material.opacity + delta * 2);

        // Brighten icon light
        iconLight.intensity = Math.min(1.5, iconLight.intensity + delta * 2);

        // Add subtle glow to mirror frame
        frameMaterial.emissive = new THREE.Color(0xd4af37);
        frameMaterial.emissiveIntensity = Math.min(0.3, (frameMaterial.emissiveIntensity || 0) + delta * 0.5);
      } else {
        // Reset when far from mirror
        lightbulbMaterial.emissiveIntensity = Math.max(0.4, lightbulbMaterial.emissiveIntensity - delta * 1.0);
        needleMaterial.emissiveIntensity = Math.max(0.5, needleMaterial.emissiveIntensity - delta * 1.0);
        heartMaterial.emissiveIntensity = Math.max(0.3, heartMaterial.emissiveIntensity - delta * 1.0);

        learningLabel.material.opacity = Math.max(0, learningLabel.material.opacity - delta * 2);
        directionLabel.material.opacity = Math.max(0, directionLabel.material.opacity - delta * 2);
        valuesLabel.material.opacity = Math.max(0, valuesLabel.material.opacity - delta * 2);

        iconLight.intensity = Math.max(0, iconLight.intensity - delta * 2);

        if (frameMaterial.emissiveIntensity) {
          frameMaterial.emissiveIntensity = Math.max(0, frameMaterial.emissiveIntensity - delta * 0.5);
        }
      }

      // Subtle light flickering
      warmLight1.intensity = 1.2 + Math.sin(time * 0.8) * 0.1;
      warmLight2.intensity = 1.2 + Math.sin(time * 0.8 + Math.PI) * 0.1;
    },
  });

  scene.add(group);
  return group;
}
