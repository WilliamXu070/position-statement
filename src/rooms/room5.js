import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createParticleSystem } from "../utils/geometry.js";
import { createTextPanel } from "../utils/textPanel.js";

// ROOM 5: Microscope Platform - Academic experience
export function createRoom5(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -800);

  scene.background = new THREE.Color(0x000033);
  scene.fog = new THREE.FogExp2(0x000033, 0.001);

  // Lab floor with scientific grid pattern
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
      color: 0x3a3a4a,
      roughness: 0.7,
      metalness: 0.2,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);

  // Detailed microscope structure
  const microscopeGroup = new THREE.Group();
  const microscopeMetal = new THREE.MeshStandardMaterial({
    color: 0x5a5a6a,
    metalness: 0.8,
    roughness: 0.3,
  });

  // Base (heavy, stable)
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 4, 0.5, 16),
    microscopeMetal
  );
  base.position.y = 0.25;
  microscopeGroup.add(base);

  // Vertical arm
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 6, 16),
    microscopeMetal
  );
  arm.position.set(-2, 3.5, 0);
  microscopeGroup.add(arm);

  // Horizontal stage support
  const stageSupport = new THREE.Mesh(
    new THREE.BoxGeometry(5, 0.3, 0.3),
    microscopeMetal
  );
  stageSupport.position.set(0, 3, 0);
  microscopeGroup.add(stageSupport);

  // Stage (specimen platform)
  const stage = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 2.5, 0.3, 16),
    new THREE.MeshStandardMaterial({
      color: 0x4a4a5a,
      metalness: 0.6,
      roughness: 0.4,
    })
  );
  stage.position.y = 3.5;
  microscopeGroup.add(stage);

  // Objective lens (stepped cylinders)
  const objective1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1, 1.5, 16),
    microscopeMetal
  );
  objective1.position.y = 2.2;
  microscopeGroup.add(objective1);

  const objective2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.8, 1, 16),
    microscopeMetal
  );
  objective2.position.y = 1.2;
  microscopeGroup.add(objective2);

  // Eyepiece
  const eyepiece = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.5, 1.5, 16),
    microscopeMetal
  );
  eyepiece.position.set(-2, 7, 0);
  eyepiece.rotation.x = Math.PI / 6;
  microscopeGroup.add(eyepiece);

  // Illumination ring
  const illumRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.1, 16, 32),
    new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 1.5,
    })
  );
  illumRing.position.y = 4.5;
  illumRing.rotation.x = Math.PI / 2;
  microscopeGroup.add(illumRing);

  microscopeGroup.position.y = 0;
  group.add(microscopeGroup);

  // Enhanced cells with organelles
  const cells = [];
  for (let i = 0; i < 20; i++) {
    const cellGroup = new THREE.Group();

    // Cell membrane
    const membrane = new THREE.Mesh(
      new THREE.SphereGeometry(0.4 + Math.random() * 0.3, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00aa55,
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.6,
      })
    );
    cellGroup.add(membrane);

    // Nucleus
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0x0088ff,
        emissive: 0x0066aa,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.9,
      })
    );
    cellGroup.add(nucleus);

    // Organelles (small spheres)
    for (let j = 0; j < 3; j++) {
      const organelle = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xffaa00,
          emissive: 0xff8800,
          emissiveIntensity: 1.0,
        })
      );
      organelle.position.set(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );
      cellGroup.add(organelle);
    }

    cellGroup.position.set(
      (Math.random() - 0.5) * 8,
      3 + (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 8
    );
    cellGroup.userData.rotationSpeed = (Math.random() - 0.5) * 0.5;
    cellGroup.userData.floatOffset = Math.random() * Math.PI * 2;

    group.add(cellGroup);
    cells.push(cellGroup);
  }

  // DNA helix structures
  const dnaHelixes = [];
  for (let h = 0; h < 3; h++) {
    const helixGroup = new THREE.Group();
    const helixHeight = 4;
    const helixRadius = 0.3;
    const steps = 20;

    // Create double helix
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const y = t * helixHeight - helixHeight / 2;
      const angle1 = t * Math.PI * 4;
      const angle2 = angle1 + Math.PI;

      // First strand
      const sphere1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xff2266,
          emissive: 0xff0044,
          emissiveIntensity: 1.0,
        })
      );
      sphere1.position.set(
        Math.cos(angle1) * helixRadius,
        y,
        Math.sin(angle1) * helixRadius
      );
      helixGroup.add(sphere1);

      // Second strand
      const sphere2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0x22aaff,
          emissive: 0x0088ff,
          emissiveIntensity: 1.0,
        })
      );
      sphere2.position.set(
        Math.cos(angle2) * helixRadius,
        y,
        Math.sin(angle2) * helixRadius
      );
      helixGroup.add(sphere2);

      // Connection (base pair)
      if (i % 2 === 0) {
        const connection = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, helixRadius * 2, 8),
          new THREE.MeshStandardMaterial({
            color: 0xaaaaff,
            emissive: 0x6666aa,
            emissiveIntensity: 0.5,
          })
        );
        connection.position.y = y;
        connection.rotation.z = Math.PI / 2;
        connection.rotation.y = angle1;
        helixGroup.add(connection);
      }
    }

    const angle = (h / 3) * Math.PI * 2;
    helixGroup.position.set(
      Math.cos(angle) * 12,
      3,
      Math.sin(angle) * 12
    );
    helixGroup.rotation.x = Math.PI / 6;
    helixGroup.userData.rotationSpeed = 0.2;

    group.add(helixGroup);
    dnaHelixes.push(helixGroup);
  }

  // Improved Earth with atmosphere
  const earthGroup = new THREE.Group();

  // Earth sphere
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0x3a6a4a,
      emissive: 0x1a3a2a,
      emissiveIntensity: 0.3,
      roughness: 0.8,
    })
  );
  earthGroup.add(earth);

  // Cloud layer
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(51, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      roughness: 1.0,
    })
  );
  earthGroup.add(clouds);

  // Atmosphere glow
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(54, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0x4a9aff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      emissive: 0x2a6aff,
      emissiveIntensity: 0.5,
    })
  );
  earthGroup.add(atmosphere);

  earthGroup.position.set(0, -100, -200);
  group.add(earthGroup);

  // Star particles
  const stars = createParticleSystem(150, {
    size: 0.5,
    color: 0xffffff,
    spread: 200,
    emissive: true,
    opacity: 0.8,
    centerPosition: new THREE.Vector3(0, 20, 0)
  });
  group.add(stars);

  // Text panels
  const panel1 = createTextPanel({
    title: "Experience 1 – Academic: Cellphone Microscope",
    body: [
      "I developed a $100 cellphone-based microscope so that anyone with a phone could see cells.",
      "The dream was to make microscopy accessible — whether for healthcare, research, or simple curiosity.",
      "",
      "I learned that the engineering design process is what stops people from giving up.",
      "",
      "If you give a caveman a rock and tell them to go to the moon, they don't know where to start.",
      "But if you teach them physics, materials, and planning, suddenly the impossible becomes structured.",
      "",
      "Through this project, I learned that understanding the field first is critical.",
      "Without that knowledge, you don't have a direction — you just have an idea.",
      "",
      "Engineering taught me how to break down a dream into steps, and how to solve problems as they appear.",
      "",
      "This experience changed how I see engineering.",
      "There are too many smart people in the world.",
      "Most ideas have already been thought of.",
      "Most progress is incremental, not revolutionary.",
      "",
      "My original microscope design had low frame rates and high computational demands.",
      "Instead of giving up, I optimized the system.",
      "I developed better algorithms and image capture methods to reduce processing time and make the device more practical.",
      "",
      "This taught me that engineering is not always about creating something completely new.",
      "Sometimes it is about making something better.",
    ],
    width: 9,
    height: 10,
  });
  panel1.position.set(0, 3, -14);
  group.add(panel1);

  const ambientLight = new THREE.AmbientLight(0x4a4a6a, 0.3);
  scene.add(ambientLight);

  const lensLight = new THREE.PointLight(0x00ff88, 3, 25);
  lensLight.position.set(0, 3.5, 0);
  scene.add(lensLight);

  rooms.push({
    id: "room5",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -800),
    update: (time, delta) => {
      // Animate cells
      cells.forEach((cell, i) => {
        cell.position.y += Math.sin(time * 2 + cell.userData.floatOffset) * 0.01;
        cell.rotation.x += cell.userData.rotationSpeed * delta;
        cell.rotation.y += cell.userData.rotationSpeed * delta * 0.7;
      });

      // Animate DNA helixes
      dnaHelixes.forEach((helix) => {
        helix.rotation.y += helix.userData.rotationSpeed * delta;
      });

      // Rotate Earth and clouds
      earth.rotation.y += delta * 0.05;
      clouds.rotation.y += delta * 0.07;

      // Twinkle stars
      const starPositions = stars.geometry.attributes.position;
      stars.material.opacity = 0.6 + Math.sin(time * 2) * 0.2;

      // Pulse illumination ring
      illumRing.material.emissiveIntensity = 1.2 + Math.sin(time * 3) * 0.3;

      // Pulse lens light
      lensLight.intensity = 2.5 + Math.sin(time * 2) * 0.5;
    },
  });

  scene.add(group);
  return group;
}
