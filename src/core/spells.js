import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

export function createWand() {
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

  // Wand tuning: position (x, y, z) and rotation (pitch, yaw, roll) in radians.
  const basePosition = new THREE.Vector3(0.32, -0.25, -0.55);
  const baseRotation = new THREE.Euler(-0.3, -Math.PI / 2, 0.05);
  group.position.copy(basePosition);
  group.rotation.copy(baseRotation);
  group.userData.basePosition = basePosition.clone();
  group.userData.baseRotation = baseRotation.clone();
  return group;
}

export function createLightningBeam() {
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

export function getSpellHit(wand, camera, raycaster, spellTargets, tempVec, tempVec2) {
  if (!wand.userData.tip) {
    return null;
  }
  const origin = tempVec;
  const dir = tempVec2;
  wand.userData.tip.getWorldPosition(origin);
  camera.getWorldDirection(dir);
  raycaster.set(origin, dir);
  raycaster.far = 100;
  const hits = raycaster.intersectObjects(spellTargets, false);
  return hits.length > 0 ? hits[0] : null;
}
