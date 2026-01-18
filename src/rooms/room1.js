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

    // Scale factor for smaller pillars
    const scale = 0.6;

    // Pillar shaft (fluted column)
    const shaftGeometry = new THREE.CylinderGeometry(0.6 * scale, 0.7 * scale, 8 * scale, 16, 1);
    const shaftMaterial = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.3,
      metalness: 0.05,
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = 4 * scale;
    pillarGroup.add(shaft);

    // Base (wider bottom)
    const baseGeometry = new THREE.CylinderGeometry(0.8 * scale, 1 * scale, 1 * scale, 16);
    const base = new THREE.Mesh(baseGeometry, shaftMaterial);
    base.position.y = 0.5 * scale;
    pillarGroup.add(base);

    // Capital (decorative top)
    const capitalGeometry = new THREE.CylinderGeometry(1 * scale, 0.7 * scale, 0.8 * scale, 16);
    const capital = new THREE.Mesh(capitalGeometry, shaftMaterial);
    capital.position.y = 8.4 * scale;
    pillarGroup.add(capital);

    // Abacus (square top piece)
    const abacusGeometry = new THREE.BoxGeometry(1.4 * scale, 0.3 * scale, 1.4 * scale);
    const abacus = new THREE.Mesh(abacusGeometry, shaftMaterial);
    abacus.position.y = 9 * scale;
    pillarGroup.add(abacus);

    // Glowing text on the pillar - LARGER canvas and font
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Clear background
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text with word wrapping for multi-line text
    const lines = text.split('\n');
    const lineHeight = 120;
    const fontSize = 100;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
      const y = startY + i * lineHeight;

      // Yellow glow (outer)
      ctx.shadowColor = 'rgba(255, 215, 0, 1)';
      ctx.shadowBlur = 30;
      ctx.fillStyle = '#ffd700';
      ctx.fillText(line.toUpperCase(), canvas.width / 2, y);

      // Black text (inner) - draw on top for contrast
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000000';
      ctx.fillText(line.toUpperCase(), canvas.width / 2, y);
    });

    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const textPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 2),
      textMaterial
    );
    textPanel.position.y = 3 * scale;
    textPanel.position.z = 0.8 * scale;
    pillarGroup.add(textPanel);

    // Add point light for glow
    const glowLight = new THREE.PointLight(0xffd700, 1, 10);
    glowLight.position.set(0, 3 * scale, 1);
    pillarGroup.add(glowLight);

    pillarGroup.position.set(x, 0, z);
    return pillarGroup;
  }

  // Create 4 pillars in a square formation - positioned to fit on 30x30 platform
  const pillar1 = createPillar(-6, -6, "Question\nAssumptions");
  const pillar2 = createPillar(6, -6, "First\nPrinciples");
  const pillar3 = createPillar(-6, -15, "Reduce\nComplexity");
  const pillar4 = createPillar(6, -15, "Iteration");

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

  // Add clouds around and below the platform (not on it)
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 25 + Math.random() * 20; // Further away
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius - 10;
    const y = -10 + Math.random() * 8; // Lower, below platform
    const scale = 3 + Math.random() * 3; // Bigger clouds

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
