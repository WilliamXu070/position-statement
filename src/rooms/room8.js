import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";
import { createParticleSystem } from "../utils/geometry.js";
import { createTextPanel } from "../utils/textPanel.js";

// ROOM 8: Infinite Sky - Conclusion, imagination
export function createRoom8(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -1400);

  scene.background = new THREE.Color(0x000033);
  scene.fog = new THREE.FogExp2(0x000033, 0.0005);

  // Ethereal transparent platform with constellation patterns
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
      color: 0x4a4a6a,
      emissive: 0x6a6aaa,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0.8,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);

  // Enhanced star field with varied sizes
  const stars = [];
  const starSizes = [0.1, 0.15, 0.2, 0.3, 0.5]; // Varied sizes

  for (let i = 0; i < 400; i++) {
    const size = starSizes[Math.floor(Math.random() * starSizes.length)];
    const star = new THREE.Mesh(
      new THREE.SphereGeometry(size, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1.5,
      })
    );
    star.position.set(
      (Math.random() - 0.5) * 250,
      Math.random() * 120 + 5,
      (Math.random() - 0.5) * 250
    );
    star.userData.twinkleSpeed = 1 + Math.random() * 3;
    star.userData.twinkleOffset = Math.random() * Math.PI * 2;
    group.add(star);
    stars.push(star);

    // Add diffraction spikes to larger stars
    if (size > 0.2) {
      const spikeLength = size * 3;
      const spikeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
      });

      // Horizontal spike
      const hSpike = new THREE.Mesh(
        new THREE.PlaneGeometry(spikeLength, size * 0.2),
        spikeMaterial
      );
      hSpike.position.copy(star.position);
      group.add(hSpike);

      // Vertical spike
      const vSpike = new THREE.Mesh(
        new THREE.PlaneGeometry(size * 0.2, spikeLength),
        spikeMaterial
      );
      vSpike.position.copy(star.position);
      group.add(vSpike);
    }
  }

  // Shooting stars
  const shootingStars = [];
  for (let i = 0; i < 5; i++) {
    const shootingStar = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffffaa,
        emissive: 0xffffaa,
        emissiveIntensity: 2.0,
      })
    );
    shootingStar.position.set(
      (Math.random() - 0.5) * 200,
      20 + Math.random() * 80,
      (Math.random() - 0.5) * 200
    );
    shootingStar.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 20,
      -5 - Math.random() * 10,
      (Math.random() - 0.5) * 20
    );
    shootingStar.userData.resetTimer = Math.random() * 10;
    group.add(shootingStar);
    shootingStars.push(shootingStar);
  }

  // Organic cloud clusters
  const cloudClusters = [];
  for (let c = 0; c < 12; c++) {
    const clusterGroup = new THREE.Group();
    const clusterSize = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < clusterSize; i++) {
      const cloudSize = 2 + Math.random() * 3;
      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(cloudSize, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xaaaaaa,
          transparent: true,
          opacity: 0.5,
          emissive: 0x6a6a8a,
          emissiveIntensity: 0.2,
        })
      );
      cloud.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 8
      );
      clusterGroup.add(cloud);
    }

    clusterGroup.position.set(
      (Math.random() - 0.5) * 120,
      8 + Math.random() * 35,
      (Math.random() - 0.5) * 120
    );
    clusterGroup.userData.driftSpeed = 0.1 + Math.random() * 0.2;
    clusterGroup.userData.driftAngle = Math.random() * Math.PI * 2;

    group.add(clusterGroup);
    cloudClusters.push(clusterGroup);
  }

  // Abstract/impossible structures (Penrose triangles, fractals)
  const abstractStructures = [];

  // Penrose-like triangle (impossible object)
  for (let p = 0; p < 3; p++) {
    const penroseGroup = new THREE.Group();
    const angle = (p / 3) * Math.PI * 2;
    const distance = 30 + Math.random() * 20;

    // Create three connected beams forming impossible triangle
    for (let i = 0; i < 3; i++) {
      const beamAngle = (i / 3) * Math.PI * 2;
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 8),
        new THREE.MeshStandardMaterial({
          color: 0x8a6aaa,
          emissive: 0x6a4a8a,
          emissiveIntensity: 0.8,
          metalness: 0.7,
          roughness: 0.3,
        })
      );
      beam.position.set(
        Math.cos(beamAngle) * 4,
        Math.sin(beamAngle) * 4,
        0
      );
      beam.rotation.z = beamAngle;
      penroseGroup.add(beam);
    }

    penroseGroup.position.set(
      Math.cos(angle) * distance,
      10 + Math.random() * 15,
      Math.sin(angle) * distance
    );
    penroseGroup.userData.rotationSpeed = 0.2 + Math.random() * 0.3;

    group.add(penroseGroup);
    abstractStructures.push(penroseGroup);
  }

  // Geometric fractals (recursive cube structures)
  for (let f = 0; f < 8; f++) {
    const fractalGroup = new THREE.Group();

    function createFractal(size, depth, maxDepth) {
      if (depth >= maxDepth) return;

      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        new THREE.MeshStandardMaterial({
          color: 0x6a8aaa,
          emissive: 0x4a6a8a,
          emissiveIntensity: 0.6,
          transparent: true,
          opacity: 0.7 - (depth * 0.2),
        })
      );
      fractalGroup.add(cube);

      if (depth < maxDepth - 1) {
        const newSize = size * 0.5;
        const offset = size * 0.6;
        const positions = [
          [offset, offset, 0],
          [-offset, offset, 0],
          [0, -offset, offset],
          [0, offset, -offset],
        ];

        positions.forEach(pos => {
          const childGroup = new THREE.Group();
          childGroup.position.set(...pos);
          fractalGroup.add(childGroup);
          createFractal(newSize, depth + 1, maxDepth);
        });
      }
    }

    createFractal(2, 0, 3);

    const angle = (f / 8) * Math.PI * 2;
    fractalGroup.position.set(
      Math.cos(angle) * (25 + Math.random() * 15),
      12 + Math.random() * 18,
      Math.sin(angle) * (25 + Math.random() * 15)
    );
    fractalGroup.userData.rotationSpeed = (Math.random() - 0.5) * 0.4;

    group.add(fractalGroup);
    abstractStructures.push(fractalGroup);
  }

  // Blueprint wireframe ideas
  for (let w = 0; w < 10; w++) {
    const wireframeGeo = new THREE.TorusKnotGeometry(1.5, 0.3, 64, 16);
    const wireframe = new THREE.Mesh(
      wireframeGeo,
      new THREE.MeshStandardMaterial({
        color: 0x4a9aff,
        emissive: 0x2a6aff,
        emissiveIntensity: 0.7,
        wireframe: true,
      })
    );
    wireframe.position.set(
      (Math.random() - 0.5) * 60,
      5 + Math.random() * 25,
      (Math.random() - 0.5) * 60
    );
    wireframe.userData.floatSpeed = 0.3 + Math.random() * 0.5;
    wireframe.userData.floatOffset = Math.random() * Math.PI * 2;
    group.add(wireframe);
    abstractStructures.push(wireframe);
  }

  // Ascending particle streams (ideas launching upward)
  const ideaStreams = createParticleSystem(600, {
    size: 0.15,
    color: 0x8aaaff,
    spread: 40,
    emissive: true,
    opacity: 0.7,
    centerPosition: new THREE.Vector3(0, 0, 0)
  });
  group.add(ideaStreams);

  // Vertical light columns
  for (let l = 0; l < 5; l++) {
    const angle = (l / 5) * Math.PI * 2;
    const lightColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 150, 8),
      new THREE.MeshBasicMaterial({
        color: 0x6a8aff,
        transparent: true,
        opacity: 0.3,
      })
    );
    lightColumn.position.set(
      Math.cos(angle) * 15,
      75,
      Math.sin(angle) * 15
    );
    group.add(lightColumn);
  }

  // Text panels
  const panel1 = createTextPanel({
    title: "Conclusion – My Future Direction",
    body: [
      "No matter where I go as an engineer, I want to keep my imagination.",
      "",
      "I want to keep having wild ideas.",
      "I want to keep building.",
      "And I want to keep learning from people who challenge my thinking.",
      "",
      "Engineering design is how I turn ideas into reality.",
      "And I don't plan on stopping.",
    ],
    width: 8,
    height: 5,
  });
  panel1.position.set(0, 3, -12);
  group.add(panel1);

  const ambientLight = new THREE.AmbientLight(0x4a4a6a, 0.35);
  scene.add(ambientLight);

  const starLight = new THREE.PointLight(0xffffff, 1.5, 60);
  starLight.position.set(0, 30, 0);
  scene.add(starLight);

  rooms.push({
    id: "room8",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -1400),
    update: (time, delta) => {
      // Twinkle stars with varied speeds
      stars.forEach((star) => {
        star.material.emissiveIntensity = 1 + Math.sin(time * star.userData.twinkleSpeed + star.userData.twinkleOffset) * 0.5;
      });

      // Animate shooting stars
      shootingStars.forEach((star) => {
        star.userData.resetTimer -= delta;
        if (star.userData.resetTimer <= 0) {
          star.position.set(
            (Math.random() - 0.5) * 200,
            20 + Math.random() * 80,
            (Math.random() - 0.5) * 200
          );
          star.userData.resetTimer = 8 + Math.random() * 10;
        } else {
          star.position.add(star.userData.velocity.clone().multiplyScalar(delta));
        }
      });

      // Drift cloud clusters
      cloudClusters.forEach((cluster) => {
        cluster.userData.driftAngle += delta * cluster.userData.driftSpeed;
        cluster.position.x += Math.cos(cluster.userData.driftAngle) * 0.02;
        cluster.position.z += Math.sin(cluster.userData.driftAngle) * 0.02;
        cluster.rotation.y += delta * 0.1;
      });

      // Rotate abstract structures
      abstractStructures.forEach((structure) => {
        if (structure.userData.rotationSpeed) {
          structure.rotation.x += structure.userData.rotationSpeed * delta;
          structure.rotation.y += structure.userData.rotationSpeed * delta * 0.7;
        }
        if (structure.userData.floatSpeed) {
          structure.position.y += Math.sin(time * structure.userData.floatSpeed + structure.userData.floatOffset) * 0.02;
        }
      });

      // Animate ascending idea particles
      const positions = ideaStreams.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3 + 1] += delta * (2 + Math.random()); // Ascend
        // Reset particles that go too high
        if (positions.array[i * 3 + 1] > 50) {
          positions.array[i * 3 + 1] = 0;
        }
      }
      positions.needsUpdate = true;

      // Pulse platform glow
      platform.material.emissiveIntensity = 0.3 + Math.sin(time * 0.5) * 0.1;
    },
  });

  scene.add(group);
  return group;
}
