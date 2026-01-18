import * as THREE from "three";

// Global array to store collision boxes
export const collisionBoxes = [];

/**
 * Add a collision box for an object
 * @param {THREE.Object3D} object - The 3D object
 * @param {THREE.Vector3} offset - Position offset from object center
 * @param {THREE.Vector3} size - Size of the collision box
 */
export function addCollisionBox(object, offset = new THREE.Vector3(), size = null) {
  const box = new THREE.Box3();

  if (size) {
    // Manual size
    box.min.copy(offset).sub(new THREE.Vector3().copy(size).multiplyScalar(0.5));
    box.max.copy(offset).add(new THREE.Vector3().copy(size).multiplyScalar(0.5));
  } else {
    // Auto-calculate from object geometry
    box.setFromObject(object);
  }

  collisionBoxes.push({
    object,
    box,
    offset,
    autoUpdate: size === null, // Auto-update if calculated from geometry
  });

  console.log(`📦 Added collision box for ${object.name || 'object'}:`, box);

  return box;
}

/**
 * Add collision boxes for all meshes in a loaded GLB/GLTF model
 * @param {THREE.Group} model - The loaded GLTF scene
 * @param {THREE.Vector3} offset - Global offset
 */
export function addModelCollision(model, offset = new THREE.Vector3()) {
  const boxes = [];

  model.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const box = new THREE.Box3().setFromObject(child);

      // Only add if box has volume
      const size = new THREE.Vector3();
      box.getSize(size);

      if (size.x > 0.1 && size.z > 0.1) { // Ignore tiny objects
        collisionBoxes.push({
          object: child,
          box,
          offset,
          autoUpdate: true,
        });
        boxes.push(box);
      }
    }
  });

  console.log(`📦 Added ${boxes.length} collision boxes for model ${model.name || 'unnamed'}`);
  return boxes;
}

/**
 * Check if a point collides with any collision box
 * @param {THREE.Vector3} position - Position to check
 * @param {number} radius - Collision radius (player size)
 * @returns {boolean} True if collision detected
 */
export function checkCollision(position, radius = 0.5) {
  const playerBox = new THREE.Box3(
    new THREE.Vector3(position.x - radius, position.y - 1, position.z - radius),
    new THREE.Vector3(position.x + radius, position.y + 1, position.z + radius)
  );

  for (const collision of collisionBoxes) {
    // Update box if needed
    if (collision.autoUpdate) {
      collision.box.setFromObject(collision.object);
    }

    if (playerBox.intersectsBox(collision.box)) {
      return true;
    }
  }

  return false;
}

/**
 * Clear all collision boxes (call when changing rooms)
 */
export function clearCollisions() {
  collisionBoxes.length = 0;
  console.log('🗑️ Cleared all collision boxes');
}

/**
 * Helper to visualize collision boxes (for debugging)
 */
export function createCollisionHelper(box, color = 0x00ff00) {
  const size = new THREE.Vector3();
  box.getSize(size);

  const center = new THREE.Vector3();
  box.getCenter(center);

  const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  const material = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });

  const helper = new THREE.Mesh(geometry, material);
  helper.position.copy(center);

  return helper;
}
