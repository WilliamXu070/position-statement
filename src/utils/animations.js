import * as THREE from "three";

export function createOrbitingObject(object, radius, speed, centerPosition = new THREE.Vector3(0, 0, 0)) {
  return {
    object,
    radius,
    speed,
    angle: Math.random() * Math.PI * 2,
    center: centerPosition.clone(),
    verticalOffset: Math.random() * Math.PI * 2,
    update: function(delta) {
      this.angle += this.speed * delta;
      this.object.position.x = this.center.x + Math.cos(this.angle) * this.radius;
      this.object.position.z = this.center.z + Math.sin(this.angle) * this.radius;
      this.object.position.y = this.center.y + Math.sin(this.angle * 2 + this.verticalOffset) * 0.5;
    }
  };
}

export function updatePulse(object, time, frequency = 1.0, amount = 0.1) {
  const scale = 1 + Math.sin(time * frequency) * amount;
  object.scale.setScalar(scale);
}
