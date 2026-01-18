import * as THREE from "three";

export function createParticleSystem(count, options = {}) {
  const {
    size = 0.1,
    color = 0xffffff,
    spread = 10,
    emissive = true,
    opacity = 0.8,
    centerPosition = new THREE.Vector3(0, 0, 0)
  } = options;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = centerPosition.x + (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = centerPosition.y + (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = centerPosition.z + (Math.random() - 0.5) * spread;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size,
    color,
    transparent: true,
    opacity,
    blending: emissive ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: false
  });

  return new THREE.Points(geometry, material);
}

export function addBlueprintOutline(mesh, color = 0x4a90e2) {
  const edges = new THREE.EdgesGeometry(mesh.geometry);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color, linewidth: 1 })
  );
  mesh.add(line);
  return line;
}

export function makeGlow(mesh, color, intensity = 1.0) {
  if (mesh.material) {
    mesh.material.emissive = new THREE.Color(color);
    mesh.material.emissiveIntensity = intensity;
  }
  const light = new THREE.PointLight(color, intensity * 0.5, 10);
  mesh.add(light);
  return light;
}

export function createHumanoidSilhouette(scale = 1) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0x1a1a3a,
    emissiveIntensity: 0.3
  });

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.15 * scale, 16, 16),
    material
  );
  head.position.y = 0.85 * scale;
  group.add(head);

  // Torso
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12 * scale, 0.15 * scale, 0.5 * scale, 16),
    material
  );
  torso.position.y = 0.5 * scale;
  group.add(torso);

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, 0.5 * scale, 8);
  const leftArm = new THREE.Mesh(armGeo, material);
  leftArm.position.set(-0.2 * scale, 0.5 * scale, 0);
  leftArm.rotation.z = Math.PI / 6;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, material);
  rightArm.position.set(0.2 * scale, 0.5 * scale, 0);
  rightArm.rotation.z = -Math.PI / 6;
  group.add(rightArm);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 0.5 * scale, 8);
  const leftLeg = new THREE.Mesh(legGeo, material);
  leftLeg.position.set(-0.08 * scale, 0, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, material);
  rightLeg.position.set(0.08 * scale, 0, 0);
  group.add(rightLeg);

  return group;
}
