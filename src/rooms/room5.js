import * as THREE from "three";
import { EYE_HEIGHT } from "../constants.js";

// ROOM 5: DFS Iterative Cycle Visualization
export function createRoom5(scene, rooms, spellTargets) {
  const group = new THREE.Group();
  group.position.set(0, 0, -800);

  // Dark background for focus on tree
  scene.background = new THREE.Color(0x0a0a0a);
  scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);

  // Simple floor
  const platform = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 1.0,
    })
  );
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 0;
  group.add(platform);
  spellTargets.push(platform);

  // Tree structure data
  const treeNodes = [];
  const treeLines = [];

  // Helper to create a tree node
  function createNode(label, position, isDeadEnd = false, isFinal = false) {
    const nodeGroup = new THREE.Group();

    // Node sphere
    const nodeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x4488ff,
        emissive: 0x2244aa,
        emissiveIntensity: 0.5,
        roughness: 0.4,
        metalness: 0.3,
      })
    );
    nodeGroup.add(nodeMesh);

    // Label
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, canvas.width / 2, canvas.height / 2);

    const labelTexture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: labelTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 0.75),
      labelMaterial
    );
    labelMesh.position.y = 0.8;
    nodeGroup.add(labelMesh);

    nodeGroup.position.copy(position);
    nodeGroup.userData.isDeadEnd = isDeadEnd;
    nodeGroup.userData.isFinal = isFinal;
    nodeGroup.userData.nodeMesh = nodeMesh;
    nodeGroup.userData.visited = false;

    group.add(nodeGroup);
    treeNodes.push(nodeGroup);
    return nodeGroup;
  }

  // Helper to create a line between nodes
  function createLine(startNode, endNode) {
    const points = [
      startNode.position.clone(),
      endNode.position.clone(),
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x444444,
      linewidth: 2,
    });

    const line = new THREE.Line(geometry, material);
    group.add(line);
    treeLines.push(line);
    return line;
  }

  // Build the tree structure
  const root = createNode("Start", new THREE.Vector3(0, 6, -10));

  // Idea A branch
  const ideaA = createNode("Idea A", new THREE.Vector3(-4, 4, -12));
  const a1 = createNode("A1 (failed)", new THREE.Vector3(-6, 2, -14), true);
  const a2 = createNode("A2 (slow)", new THREE.Vector3(-4, 1.5, -13), true);
  const a3 = createNode("A3 (better)", new THREE.Vector3(-2, 2, -14));

  // Idea B branch
  const ideaB = createNode("Idea B", new THREE.Vector3(0, 4, -13));
  const b1 = createNode("B1 (blocked)", new THREE.Vector3(0, 2, -15), true);

  // Idea C branch (final solution)
  const ideaC = createNode("Idea C", new THREE.Vector3(4, 4, -12));
  const final = createNode("Final!", new THREE.Vector3(4, 2, -14), false, true);

  // Create lines
  createLine(root, ideaA);
  createLine(root, ideaB);
  createLine(root, ideaC);
  createLine(ideaA, a1);
  createLine(ideaA, a2);
  createLine(ideaA, a3);
  createLine(ideaB, b1);
  createLine(ideaC, final);

  // DFS traversal rectangle
  const traveler = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshStandardMaterial({
      color: 0xff4444,
      emissive: 0xff2222,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.5,
    })
  );
  traveler.position.copy(root.position);
  group.add(traveler);

  // Video screen below the tree (initially hidden)
  const video = document.createElement('video');
  video.src = 'Wicker.mov';
  video.muted = true;
  video.loop = false;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  const screenGeometry = new THREE.PlaneGeometry(8, 4.5);
  const screenMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0, // Start invisible
  });

  const videoScreen = new THREE.Mesh(screenGeometry, screenMaterial);
  videoScreen.position.set(0, -2, -6); // Below tree, in front (closer to player)
  videoScreen.rotation.x = 0; // Face forward
  videoScreen.visible = false; // Initially hidden
  group.add(videoScreen);

  // Screen frame/border (initially hidden)
  const frameGeometry = new THREE.PlaneGeometry(8.4, 4.9);
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.3,
    metalness: 0.7,
    transparent: true,
    opacity: 0,
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.set(0, -2, -6.05); // Behind screen
  frame.visible = false; // Initially hidden
  group.add(frame);

  // Store video reference
  group.userData.video = video;
  group.userData.videoScreen = videoScreen;
  group.userData.videoFrame = frame;

  // DFS path (order of traversal)
  const dfsPath = [
    root, ideaA, a1, // Visit A1 (dead end)
    ideaA, a2,       // Backtrack, visit A2 (dead end)
    ideaA, a3,       // Backtrack, visit A3
    ideaA, root,     // Backtrack to root
    ideaB, b1,       // Visit B1 (dead end)
    ideaB, root,     // Backtrack to root
    ideaC, final,    // Visit C and find final solution!
  ];

  let pathIndex = 0;
  let transitionProgress = 0;
  const transitionSpeed = 0.8; // Speed of movement between nodes
  let animationComplete = false;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x222222, 0.5);
  scene.add(ambientLight);

  const treeLight = new THREE.PointLight(0x4488ff, 1.5, 30);
  treeLight.position.set(0, 8, -12);
  scene.add(treeLight);

  // Video screen light (initially off)
  const videoLight = new THREE.PointLight(0xffffff, 0, 15);
  videoLight.position.set(0, -2, -4);
  scene.add(videoLight);

  // Store light reference
  group.userData.videoLight = videoLight;

  rooms.push({
    id: "room5",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -800),
    update: (time, delta) => {
      if (animationComplete) {
        // Pulse the final node
        if (final.userData.nodeMesh) {
          final.userData.nodeMesh.material.emissiveIntensity = 0.8 + Math.sin(time * 4) * 0.3;
        }

        // Fade in video screen and frame
        if (videoScreen && videoScreen.material.opacity < 1) {
          videoScreen.material.opacity = Math.min(1, videoScreen.material.opacity + delta * 0.5);
        }
        if (frame && frame.material.opacity < 1) {
          frame.material.opacity = Math.min(1, frame.material.opacity + delta * 0.5);
        }
        if (videoLight && videoLight.intensity < 1.5) {
          videoLight.intensity = Math.min(1.5, videoLight.intensity + delta * 1.0);
        }

        return;
      }

      // Animate traveler along DFS path
      if (pathIndex < dfsPath.length - 1) {
        const currentNode = dfsPath[pathIndex];
        const nextNode = dfsPath[pathIndex + 1];

        // Lerp between current and next node
        transitionProgress += delta * transitionSpeed;

        if (transitionProgress >= 1.0) {
          // Reached next node
          transitionProgress = 0;
          pathIndex++;

          // Mark node as visited
          nextNode.userData.visited = true;

          // Check if dead end
          if (nextNode.userData.isDeadEnd && nextNode.userData.nodeMesh) {
            // Turn grey
            nextNode.userData.nodeMesh.material.color.setHex(0x666666);
            nextNode.userData.nodeMesh.material.emissive.setHex(0x333333);
            nextNode.userData.nodeMesh.material.emissiveIntensity = 0.2;
          }

          // Check if final solution
          if (nextNode.userData.isFinal) {
            animationComplete = true;
            // Make it glow
            if (nextNode.userData.nodeMesh) {
              nextNode.userData.nodeMesh.material.color.setHex(0x44ff44);
              nextNode.userData.nodeMesh.material.emissive.setHex(0x22ff22);
              nextNode.userData.nodeMesh.material.emissiveIntensity = 1.0;
            }
            // Show video screen and play
            if (videoScreen && frame && video) {
              videoScreen.visible = true;
              frame.visible = true;

              video.play().then(() => {
                console.log('🎬 Video playing on 3D screen');
              }).catch(err => {
                console.error('❌ Video play failed:', err);
              });
            }
          }
        } else {
          // Interpolate position
          traveler.position.lerpVectors(
            currentNode.position,
            nextNode.position,
            transitionProgress
          );
        }
      }

      // Rotate traveler
      traveler.rotation.y += delta * 3;
      traveler.rotation.x += delta * 2;

      // Pulse visited nodes
      treeNodes.forEach((node) => {
        if (node.userData.visited && !node.userData.isDeadEnd && !node.userData.isFinal) {
          if (node.userData.nodeMesh) {
            node.userData.nodeMesh.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.2;
          }
        }
      });
    },
  });

  scene.add(group);
  return group;
}
