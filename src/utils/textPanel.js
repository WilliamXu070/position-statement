import * as THREE from "three";

let rendererInstance = null;

export function initTextPanelSystem(renderer) {
  rendererInstance = renderer;
}

export function createTextPanel({ title, body, width = 6, height = 3.4 }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f3efe7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1f1c17";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  let y = 40;
  const padding = 60;

  if (title) {
    ctx.font = "700 46px Georgia";
    y = drawWrappedText(ctx, title, padding, y, 900, 52);
    y += 12;
  }

  ctx.font = "28px Georgia";
  body.forEach((paragraph) => {
    y = drawWrappedText(ctx, paragraph, padding, y, 900, 38);
    y += 16;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = rendererInstance.capabilities.getMaxAnisotropy();

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const geometry = new THREE.PlaneGeometry(width, height);
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;

  words.forEach((word) => {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== "") {
      ctx.fillText(line, x, cursorY);
      line = word + " ";
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line.trim() !== "") {
    ctx.fillText(line, x, cursorY);
    cursorY += lineHeight;
  }

  return cursorY;
}
