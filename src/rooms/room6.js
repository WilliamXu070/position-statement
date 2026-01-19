import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { EYE_HEIGHT } from "../constants.js";
import { addCollisionBox } from "../core/collision.js";

// ROOM 6: Heavenly Palace with Mirror Reflection
export function createRoom6(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -1000);
  const reflectionOnlyLayer = 1;

  // Heavenly sky background (same as Room 1)
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0xb0d8f0, 20, 100);

  // === MARBLE PLATFORM ===

  const textureLoader = new THREE.TextureLoader();
  const bubbleTexture = new THREE.CanvasTexture(document.createElement('canvas'));
  bubbleTexture.minFilter = THREE.LinearFilter;
  bubbleTexture.magFilter = THREE.LinearFilter;
  bubbleTexture.generateMipmaps = false;
  let marbleMaterial;

  textureLoader.load(
    'bubble.png',
    (texture) => {
      const bubbleCanvas = createBubbleCanvas(texture.image);
      bubbleTexture.image = bubbleCanvas;
      bubbleTexture.needsUpdate = true;
    },
    undefined,
    () => {
      console.log('Using fallback bubble texture');
    }
  );

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

  function createPillar(x, z, text) {
    const pillarGroup = new THREE.Group();
    const scale = 0.6;

    // Pillar shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.6 * scale, 0.7 * scale, 8 * scale, 16, 1);
    const shaftMaterial = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.3,
      metalness: 0.05,
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = 4 * scale;
    pillarGroup.add(shaft);

    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.8 * scale, 1 * scale, 1 * scale, 16);
    const base = new THREE.Mesh(baseGeometry, shaftMaterial);
    base.position.y = 0.5 * scale;
    pillarGroup.add(base);

    // Capital
    const capitalGeometry = new THREE.CylinderGeometry(1 * scale, 0.7 * scale, 0.8 * scale, 16);
    const capital = new THREE.Mesh(capitalGeometry, shaftMaterial);
    capital.position.y = 8.4 * scale;
    pillarGroup.add(capital);

    // Abacus
    const abacusGeometry = new THREE.BoxGeometry(1.4 * scale, 0.3 * scale, 1.4 * scale);
    const abacus = new THREE.Mesh(abacusGeometry, shaftMaterial);
    abacus.position.y = 9 * scale;
    pillarGroup.add(abacus);

    // Glowing text
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const lines = text.split('\n');
    const lineHeight = 120;
    const fontSize = 100;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, i) => {
      const y = startY + i * lineHeight;

      // Yellow glow
      ctx.shadowColor = 'rgba(255, 215, 0, 1)';
      ctx.shadowBlur = 30;
      ctx.fillStyle = '#ffd700';
      ctx.fillText(line.toUpperCase(), canvas.width / 2, y);

      // Black text
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

    // Point light for glow
    const glowLight = new THREE.PointLight(0xffd700, 1, 10);
    glowLight.position.set(0, 3 * scale, 1);
    pillarGroup.add(glowLight);

    pillarGroup.position.set(x, 0, z);
    return pillarGroup;
  }

  const platformHalf = 15;
  const backRowZ = -14;

  // Create 4 pillars in square formation around the center
  const pillar1 = createPillar(-8, -8, "Question\nAssumptions");
  const pillar2 = createPillar(8, -8, "First\nPrinciples");
  const pillar3 = createPillar(-8, backRowZ, "Reduce\nComplexity");
  const pillar4 = createPillar(8, backRowZ, "Iteration");

  group.add(pillar1);
  group.add(pillar2);
  group.add(pillar3);
  group.add(pillar4);

  spellTargets.push(...[pillar1, pillar2, pillar3, pillar4]);

  // === REFLECTION SUMMARY PANELS ===

  function createBubbleCanvas(image) {
    const canvas = document.createElement('canvas');
    const width = image.width;
    const height = image.height;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const visited = new Uint8Array(width * height);
    const stack = [];

    const isWhitePixel = (index) => (
      data[index] > 240 && data[index + 1] > 240 && data[index + 2] > 240
    );

    for (let x = 0; x < width; x += 1) {
      stack.push([x, 0]);
      stack.push([x, height - 1]);
    }
    for (let y = 1; y < height - 1; y += 1) {
      stack.push([0, y]);
      stack.push([width - 1, y]);
    }

    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }
      const index = y * width + x;
      if (visited[index]) {
        continue;
      }
      visited[index] = 1;
      const dataIndex = index * 4;
      if (!isWhitePixel(dataIndex)) {
        continue;
      }
      data[dataIndex + 3] = 0;
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  function createSummaryPanel(title, bullets, x, y, z) {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    const ctx = canvas.getContext('2d');

    const padding = 90;
    const titleY = 100;
    const underlineY = 140;
    const bulletStartY = 210;
    const lineHeight = 56;
    const bulletGap = 24;
    const bottomPadding = 120;
    const maxWidth = canvas.width - padding * 2 - 30;

    const wrapLines = (text) => {
      const words = text.split(' ');
      const lines = [];
      let line = '';

      words.forEach((word) => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = testLine;
        }
      });

      if (line.trim() !== '') {
        lines.push(line.trim());
      }

      return lines;
    };

    ctx.font = '46px Georgia';
    const bulletLines = bullets.map((bullet) => wrapLines(bullet));
    const bulletHeight = bulletLines.reduce(
      (total, lines) => total + lines.length * lineHeight + bulletGap,
      0
    );

    canvas.height = bulletStartY + bulletHeight + bottomPadding;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.font = 'bold 80px Georgia';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title.toUpperCase(), canvas.width / 2, titleY);

    // Title underline
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(180, underlineY);
    ctx.lineTo(canvas.width - 180, underlineY);
    ctx.stroke();

    // Bullet points
    ctx.font = '46px Georgia';
    ctx.fillStyle = '#2a2a2a';
    ctx.textAlign = 'left';
    const leftMargin = padding;
    let cursorY = bulletStartY;

    bulletLines.forEach((lines) => {
      // Bullet point
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(leftMargin, cursorY - 12, 8, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = '#2a2a2a';
      lines.forEach((line, index) => {
        const lineY = cursorY + index * lineHeight;
        ctx.fillText(line, leftMargin + 30, lineY);
      });
      cursorY += lines.length * lineHeight + bulletGap;
    });

    const texture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    textMaterial.depthWrite = false;

    const bubbleMaterial = new THREE.MeshBasicMaterial({
      map: bubbleTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const groupPanel = new THREE.Group();
    const bubbleSize = 8.2;
    const bubble = new THREE.Mesh(
      new THREE.PlaneGeometry(bubbleSize, bubbleSize),
      bubbleMaterial
    );
    bubble.layers.set(reflectionOnlyLayer);
    groupPanel.add(bubble);

    const textPanelWidth = 6.2;
    const textPanelHeight = textPanelWidth * (canvas.height / canvas.width);
    const textPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(textPanelWidth, textPanelHeight),
      textMaterial
    );
    textPanel.position.set(0, 0.3, 0.02);
    textPanel.layers.set(reflectionOnlyLayer);
    groupPanel.add(textPanel);

    groupPanel.position.set(x, y, z);
    groupPanel.layers.set(reflectionOnlyLayer);
    groupPanel.userData.materials = [bubbleMaterial, textMaterial];

    // Add subtle glow around panel
    const glowLight = new THREE.PointLight(0xffffff, 0.5, 8);
    glowLight.position.set(x, y, z + 0.5);
    glowLight.layers.set(reflectionOnlyLayer);
    group.add(glowLight);

    return groupPanel;
  }

  // Create summary panels arranged around the viewing area
  const summaryPanelScale = 0.9;

  const valuesPanel = createSummaryPanel(
    'Values',
    [
      'Clarity over complexity',
      'Accessibility over exclusivity',
      'Progress over perfection',
      'Understanding over execution'
    ],
    -8, 7, -13
  );
  valuesPanel.rotation.y = Math.PI * 0.15;
  valuesPanel.scale.setScalar(summaryPanelScale);
  valuesPanel.renderOrder = 10;
  valuesPanel.userData.depthOffset = 0.01;
  group.add(valuesPanel);

  const beliefsPanel = createSummaryPanel(
    'Beliefs',
    [
      'Question assumptions before accepting limits',
      'Return to first principles for clarity',
      'Simplify to reveal core problems',
      'Learn through iteration and reflection'
    ],
    8, 7, -13
  );
  beliefsPanel.rotation.y = -Math.PI * 0.15;
  beliefsPanel.scale.setScalar(summaryPanelScale);
  beliefsPanel.renderOrder = 11;
  beliefsPanel.userData.depthOffset = 0.02;
  group.add(beliefsPanel);

  spellTargets.push(...[valuesPanel, beliefsPanel]);

  const headLockedPanels = [
    { panel: valuesPanel, side: 0 },
    { panel: beliefsPanel, side: 0 },
  ];
  const headPanelOffset = {
    up: 3.4,
    forward: 1.1,
    side: 0,
  };
  const headPanelForward = new THREE.Vector3();
  const headPanelRight = new THREE.Vector3();
  const headPanelBase = new THREE.Vector3();
  const valuesBeliefsSwap = {
    interval: 5,
    fade: 0.4,
  };
  const setPanelOpacity = (panel, opacity) => {
    const materials = panel.userData.materials ?? [];
    materials.forEach((material) => {
      material.opacity = opacity;
      material.transparent = true;
    });
  };

  // === GIANT MIRROR IN CENTER (PLANAR REFLECTION) ===

  const mirrorWidth = 8;
  const mirrorHeight = 10;
  const mirrorGeometry = new THREE.PlaneGeometry(mirrorWidth, mirrorHeight);
  const mirrorCenterY = 5.5;
  const mirrorCenterZ = Math.max(-platformHalf + 1, backRowZ);
  const mirror = new Reflector(mirrorGeometry, {
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0x888888,
  });
  mirror.position.set(0, mirrorCenterY, mirrorCenterZ);
  group.add(mirror);
  spellTargets.push(mirror);

  const originalOnBeforeRender = mirror.onBeforeRender;
  mirror.onBeforeRender = function (renderer, scene, camera) {
    const originalMask = camera.layers.mask;
    camera.layers.enable(reflectionOnlyLayer);
    if (this.camera) {
      this.camera.layers.mask = camera.layers.mask;
    }
    if (originalOnBeforeRender) {
      originalOnBeforeRender.call(this, renderer, scene, camera);
    }
    camera.layers.mask = originalMask;
  };

  // Golden ornate frame
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0xd4af37,
    emissiveIntensity: 0.1,
  });

  const frameThickness = 0.4;
  const frameDepth = 0.6;
  const frameOuterWidth = mirrorWidth + frameThickness * 2;
  const frameOuterHeight = mirrorHeight + frameThickness * 2;
  const frameSideX = mirrorWidth / 2 + frameThickness / 2;
  const frameSideY = mirrorHeight / 2 + frameThickness / 2;

  // Frame sides
  const frameLeft = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, frameOuterHeight, frameDepth),
    frameMaterial
  );
  frameLeft.position.set(-frameSideX, mirrorCenterY, mirrorCenterZ);
  group.add(frameLeft);

  const frameRight = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, frameOuterHeight, frameDepth),
    frameMaterial
  );
  frameRight.position.set(frameSideX, mirrorCenterY, mirrorCenterZ);
  group.add(frameRight);

  const frameTop = new THREE.Mesh(
    new THREE.BoxGeometry(frameOuterWidth, frameThickness, frameDepth),
    frameMaterial
  );
  frameTop.position.set(0, mirrorCenterY + frameSideY, mirrorCenterZ);
  group.add(frameTop);

  const frameBottom = new THREE.Mesh(
    new THREE.BoxGeometry(frameOuterWidth, frameThickness, frameDepth),
    frameMaterial
  );
  frameBottom.position.set(0, mirrorCenterY - frameSideY, mirrorCenterZ);
  group.add(frameBottom);

  // Mirror collision - prevent walking through
  // Create invisible collision box for mirror
  const mirrorCollisionBox = new THREE.Mesh(
    new THREE.BoxGeometry(10, 12, 0.5),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  mirrorCollisionBox.position.set(0, mirrorCenterY, mirrorCenterZ);
  mirrorCollisionBox.name = 'mirror-collision';
  group.add(mirrorCollisionBox);

  // Add to collision system
  addCollisionBox(mirrorCollisionBox);

  // === CLOUDS ===

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
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 25 + Math.random() * 20;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius - 10;
    const y = -10 + Math.random() * 8;
    const scale = 3 + Math.random() * 3;

    const cloud = createCloud(x, y, z, scale);
    cloudGroup.add(cloud);
  }

  group.add(cloudGroup);

  // === LIGHTING ===

  // Bright ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // Sunlight from above
  const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.2);
  sunLight.position.set(10, 50, -1000);
  sunLight.castShadow = false;
  scene.add(sunLight);

  // Soft fill light from below
  const fillLight = new THREE.HemisphereLight(0xffffff, 0x87ceeb, 0.6);
  scene.add(fillLight);

  // Rim light for pillars
  const rimLight = new THREE.DirectionalLight(0xffd700, 0.3);
  rimLight.position.set(-10, 10, -1010);
  scene.add(rimLight);

  // Special light for mirror to enhance reflection
  const mirrorLight = new THREE.PointLight(0xffffff, 1.5, 20);
  mirrorLight.position.set(0, 8, -1008);
  scene.add(mirrorLight);

  rooms.push({
    id: "room6",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -1000),
    update: (time, delta, camera) => {
      // Animate clouds drifting
      cloudGroup.children.forEach((cloud) => {
        cloud.position.x += cloud.userData.driftSpeed * delta;

        if (cloud.position.x > 50) {
          cloud.position.x = cloud.userData.startX - 100;
        }

        cloud.position.y += Math.sin(time + cloud.position.x * 0.1) * 0.002;
      });

      // Pulse the glow lights on pillars
      [pillar1, pillar2, pillar3, pillar4].forEach((pillar, i) => {
        const light = pillar.children.find(child => child instanceof THREE.PointLight);
        if (light) {
          light.intensity = 0.8 + Math.sin(time * 2 + i * Math.PI / 2) * 0.3;
        }
      });

      // Pulse mirror frame glow
      frameMaterial.emissiveIntensity = 0.1 + Math.sin(time * 1.5) * 0.05;

      // Keep values/beliefs panels locked above the user's head.
      camera.getWorldDirection(headPanelForward);
      headPanelRight.crossVectors(headPanelForward, camera.up).normalize();
      headPanelBase.copy(camera.position)
        .addScaledVector(camera.up, headPanelOffset.up)
        .addScaledVector(headPanelForward, headPanelOffset.forward);

      headLockedPanels.forEach(({ panel, side }) => {
        const depthOffset = panel.userData.depthOffset ?? 0;
        const worldPos = headPanelBase.clone()
          .addScaledVector(headPanelRight, side * headPanelOffset.side)
          .addScaledVector(headPanelForward, depthOffset);
        panel.position.copy(group.worldToLocal(worldPos));
        panel.quaternion.copy(camera.quaternion);
      });

      const cycleDuration = valuesBeliefsSwap.interval * 2;
      const cycleTime = time % cycleDuration;
      const phase = cycleTime < valuesBeliefsSwap.interval ? 0 : 1;
      const phaseTime = cycleTime % valuesBeliefsSwap.interval;

      const fadeWindow = Math.min(valuesBeliefsSwap.fade, valuesBeliefsSwap.interval / 2);
      const fadeIn = Math.min(phaseTime / fadeWindow, 1);
      const fadeOut = Math.min((valuesBeliefsSwap.interval - phaseTime) / fadeWindow, 1);
      const visibleOpacity = Math.min(fadeIn, fadeOut);
      const hiddenOpacity = 1 - visibleOpacity;

      const showValues = phase === 0;
      const valuesOpacity = showValues ? visibleOpacity : hiddenOpacity;
      const beliefsOpacity = showValues ? hiddenOpacity : visibleOpacity;

      setPanelOpacity(valuesPanel, valuesOpacity);
      setPanelOpacity(beliefsPanel, beliefsOpacity);

      // Reflector updates automatically via the renderer render pass.
    },
  });

  scene.add(group);
  return group;
}
