import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";

// ROOM 1: Heavenly Platform - Engineering Principles
export function createRoom1(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);

  // Heavenly sky background
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0xb0d8f0, 20, 100);

  // === MARBLE PLATFORM ===

  // Create marble material (will use texture if available, otherwise procedural)
  const textureLoader = new THREE.TextureLoader();
  let marbleMaterial;

  // Try to load marble texture, fallback to procedural white marble
  textureLoader.load(
    'textures/marble/marble_color.jpg',
    (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      platform.material.map = texture;
      platform.material.needsUpdate = true;
    },
    undefined,
    () => {
      console.log('Using procedural marble (no texture found)');
    }
  );

  marbleMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    roughness: 0.3,
    metalness: 0.1,
  });

  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.5, 30),
    marbleMaterial
  );
  platform.position.y = -0.25;
  group.add(platform);
  spellTargets.push(platform);

  // Platform edge detail
  const platformEdge = new THREE.Mesh(
    new THREE.BoxGeometry(30.5, 0.3, 30.5),
    new THREE.MeshStandardMaterial({
      color: 0xe8e8e8,
      roughness: 0.4,
      metalness: 0.1,
    })
  );
  platformEdge.position.y = -0.5;
  group.add(platformEdge);

  // === CORINTHIAN PILLARS ===

  // Helper function to create a pillar with glowing text
  function createPillar(x, z, text) {
    const pillarGroup = new THREE.Group();

    // Pillar shaft (fluted column)
    const shaftGeometry = new THREE.CylinderGeometry(0.6, 0.7, 8, 16, 1);
    const shaftMaterial = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.3,
      metalness: 0.05,
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = 4;
    pillarGroup.add(shaft);

    // Base (wider bottom)
    const baseGeometry = new THREE.CylinderGeometry(0.8, 1, 1, 16);
    const base = new THREE.Mesh(baseGeometry, shaftMaterial);
    base.position.y = 0.5;
    pillarGroup.add(base);

    // Capital (decorative top)
    const capitalGeometry = new THREE.CylinderGeometry(1, 0.7, 0.8, 16);
    const capital = new THREE.Mesh(capitalGeometry, shaftMaterial);
    capital.position.y = 8.4;
    pillarGroup.add(capital);

    // Abacus (square top piece)
    const abacusGeometry = new THREE.BoxGeometry(1.4, 0.3, 1.4);
    const abacus = new THREE.Mesh(abacusGeometry, shaftMaterial);
    abacus.position.y = 9;
    pillarGroup.add(abacus);

    // Glowing text on the pillar
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glowing text
    ctx.font = 'bold 48px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow effect
    ctx.shadowColor = 'rgba(255, 215, 100, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffd700';
    ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);

    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const textPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 1.25),
      textMaterial
    );
    textPanel.position.y = 5;
    textPanel.position.z = 0.8;
    pillarGroup.add(textPanel);

    // Add point light for glow
    const glowLight = new THREE.PointLight(0xffd700, 0.8, 8);
    glowLight.position.set(0, 5, 1);
    pillarGroup.add(glowLight);

    pillarGroup.position.set(x, 0, z);
    return pillarGroup;
  }

  // Create 4 pillars in a square formation
  const pillar1 = createPillar(-8, -8, "Question\nAssumptions");
  const pillar2 = createPillar(8, -8, "First\nPrinciples");
  const pillar3 = createPillar(-8, -18, "Reduce\nComplexity");
  const pillar4 = createPillar(8, -18, "Iteration");

  group.add(pillar1);
  group.add(pillar2);
  group.add(pillar3);
  group.add(pillar4);

  spellTargets.push(...[pillar1, pillar2, pillar3, pillar4]);

  // === CLOUDS ===

  // Create volumetric cloud sprites around the platform
  const cloudGroup = new THREE.Group();

  function createCloud(x, y, z, scale) {
    const cloudGeometry = new THREE.SphereGeometry(1, 8, 8);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      roughness: 1,
      metalness: 0,
    });

    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloud.scale.set(scale * 3, scale, scale * 2);
    cloud.position.set(x, y, z);

    // Add multiple overlapping spheres for puffy cloud effect
    const puff1 = cloud.clone();
    puff1.position.x += scale * 1.5;
    puff1.scale.multiplyScalar(0.8);

    const puff2 = cloud.clone();
    puff2.position.x -= scale * 1.2;
    puff2.scale.multiplyScalar(0.7);

    const puff3 = cloud.clone();
    puff3.position.z += scale * 1;
    puff3.scale.multiplyScalar(0.6);

    const cloudCluster = new THREE.Group();
    cloudCluster.add(cloud);
    cloudCluster.add(puff1);
    cloudCluster.add(puff2);
    cloudCluster.add(puff3);

    cloudCluster.userData.driftSpeed = 0.1 + Math.random() * 0.1;
    cloudCluster.userData.startX = x;

    return cloudCluster;
  }

  // Add clouds around the platform
  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2;
    const radius = 20 + Math.random() * 15;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius - 13;
    const y = -3 + Math.random() * 6;
    const scale = 2 + Math.random() * 2;

    const cloud = createCloud(x, y, z, scale);
    cloudGroup.add(cloud);
  }

  group.add(cloudGroup);

  // === LIGHTING ===

  // Bright ambient light (heavenly)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // Directional light (sunlight from above)
  const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.2);
  sunLight.position.set(10, 50, 10);
  sunLight.castShadow = false;
  scene.add(sunLight);

  // Soft fill light from below (cloud bounce)
  const fillLight = new THREE.HemisphereLight(0xffffff, 0x87ceeb, 0.6);
  scene.add(fillLight);

  // Rim light for pillars
  const rimLight = new THREE.DirectionalLight(0xffd700, 0.3);
  rimLight.position.set(-10, 10, -10);
  scene.add(rimLight);

  rooms.push({
    id: "room1",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, 0),
    update: (time, delta) => {
      // Animate clouds drifting
      cloudGroup.children.forEach((cloud) => {
        cloud.position.x += cloud.userData.driftSpeed * delta;

        // Loop clouds back
        if (cloud.position.x > 50) {
          cloud.position.x = cloud.userData.startX - 100;
        }

        // Gentle bobbing
        cloud.position.y += Math.sin(time + cloud.position.x * 0.1) * 0.002;
      });

      // Pulse the glow lights on pillars
      [pillar1, pillar2, pillar3, pillar4].forEach((pillar, i) => {
        const light = pillar.children.find(child => child instanceof THREE.PointLight);
        if (light) {
          light.intensity = 0.8 + Math.sin(time * 2 + i * Math.PI / 2) * 0.3;
        }
      });
    },
  });

  scene.add(group);
  return group;
}
