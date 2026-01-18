import * as THREE from "three";

const textureCache = new Map();
let rendererInstance = null;
let textureLoaderInstance = null;

export function initTextureSystem(renderer, textureLoader) {
  rendererInstance = renderer;
  textureLoaderInstance = textureLoader;
}

export function getTexture(filename) {
  if (!textureCache.has(filename)) {
    const texture = textureLoaderInstance.load(`textures/${filename}`);
    texture.anisotropy = rendererInstance.capabilities.getMaxAnisotropy();
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    textureCache.set(filename, texture);
  }
  return textureCache.get(filename);
}

export function createProceduralTexture(type, options = {}) {
  const cacheKey = `${type}_${JSON.stringify(options)}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  const width = options.width || 512;
  const height = options.height || 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  switch(type) {
    case 'concrete':
      // Gray base with noise and cracks
      ctx.fillStyle = '#6a6a6a';
      ctx.fillRect(0, 0, width, height);
      // Add noise
      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const shade = Math.floor(Math.random() * 40) - 20;
        ctx.fillStyle = `rgb(${106+shade}, ${106+shade}, ${106+shade})`;
        ctx.fillRect(x, y, 2, 2);
      }
      // Add cracks
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 1;
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        let x = Math.random() * width;
        let y = Math.random() * height;
        ctx.moveTo(x, y);
        for (let j = 0; j < 20; j++) {
          x += (Math.random() - 0.5) * 30;
          y += (Math.random() - 0.5) * 30;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;

    case 'storm-cloud':
      // Dark purple-gray gradient with wispy shapes
      {
        const cloudGrad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        cloudGrad.addColorStop(0, '#2a2a3a');
        cloudGrad.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = cloudGrad;
        ctx.fillRect(0, 0, width, height);
        // Add wispy clouds
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 30; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const radius = 20 + Math.random() * 60;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
          grad.addColorStop(0, '#4a4a5a');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
        ctx.globalAlpha = 1.0;
      }
      break;

    case 'blueprint':
      // Blue background with white grid
      {
        ctx.fillStyle = '#0a3a6a';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        const gridSize = 32;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      }
      break;

    case 'circuit-board':
      // Green PCB with yellow traces
      {
        ctx.fillStyle = '#1a5a1a';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 2;
        // Draw circuit traces
        for (let i = 0; i < 40; i++) {
          ctx.beginPath();
          let x = Math.random() * width;
          let y = Math.random() * height;
          ctx.moveTo(x, y);
          const steps = 3 + Math.floor(Math.random() * 5);
          for (let j = 0; j < steps; j++) {
            const direction = Math.floor(Math.random() * 4);
            const length = 20 + Math.random() * 40;
            if (direction === 0) x += length;
            else if (direction === 1) x -= length;
            else if (direction === 2) y += length;
            else y -= length;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        // Add circuit pads
        ctx.fillStyle = '#ffdd66';
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;

    case 'mirror-crack':
      // Transparent with black crack lines
      {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        // Create fractal-like cracks from center
        const centerX = width / 2;
        const centerY = height / 2;
        function drawCrack(x, y, angle, length, depth) {
          if (depth > 4 || length < 5) return;
          const endX = x + Math.cos(angle) * length;
          const endY = y + Math.sin(angle) * length;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          // Branch
          const branches = 1 + Math.floor(Math.random() * 2);
          for (let i = 0; i < branches; i++) {
            const branchAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
            drawCrack(endX, endY, branchAngle, length * 0.7, depth + 1);
          }
        }
        // Create multiple crack origins
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5;
          drawCrack(centerX, centerY, angle, 100, 0);
        }
      }
      break;

    case 'cloud':
      // White fluffy cloud texture
      {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 0.7;
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const radius = 20 + Math.random() * 40;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.5, '#e0e0e0');
          grad.addColorStop(1, '#c0c0c0');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }
      break;

    case 'fog':
      // Soft gray gradient
      {
        const fogGrad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        fogGrad.addColorStop(0, '#ffffff');
        fogGrad.addColorStop(0.5, '#d0d0d0');
        fogGrad.addColorStop(1, '#a0a0a0');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, width, height);
      }
      break;

    default:
      ctx.fillStyle = options.color || '#cccccc';
      ctx.fillRect(0, 0, width, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = rendererInstance.capabilities.getMaxAnisotropy();
  textureCache.set(cacheKey, texture);
  return texture;
}
