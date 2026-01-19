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
  const textureLoader = new THREE.TextureLoader();

  // Hack the North collage wall (right side)
  const hackWallGroup = new THREE.Group();
  hackWallGroup.position.set(9, 3, -4);
  hackWallGroup.rotation.y = -Math.PI / 2;

  const wallBack = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 5.5),
    new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9,
      metalness: 0.1,
    })
  );
  hackWallGroup.add(wallBack);

  const hackWallLight = new THREE.PointLight(0xfff0d0, 1.2, 12);
  hackWallLight.position.set(7.5, 4.5, -4);
  scene.add(hackWallLight);

  const titleCanvas = document.createElement("canvas");
  titleCanvas.width = 1024;
  titleCanvas.height = 256;
  const titleCtx = titleCanvas.getContext("2d");
  titleCtx.fillStyle = "rgba(0, 0, 0, 0.6)";
  titleCtx.fillRect(0, 0, titleCanvas.width, titleCanvas.height);
  titleCtx.font = "700 65px Georgia";
  titleCtx.fillStyle = "#f7d36a";
  titleCtx.textAlign = "center";
  titleCtx.textBaseline = "middle";
  titleCtx.fillText("COLLAGE OF CATASTROPHE", titleCanvas.width / 2, titleCanvas.height / 2);

  const titleTexture = new THREE.CanvasTexture(titleCanvas);
  const titleMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(8.5, 1.6),
    new THREE.MeshStandardMaterial({
      map: titleTexture,
      transparent: true,
      roughness: 0.6,
      metalness: 0.1,
    })
  );
  titleMesh.position.set(0, 3.2, 0.08);
  hackWallGroup.add(titleMesh);

  const hackItems = [
    { type: "image", src: "Images/hack/ubisoft.jpg" },
    { type: "image", src: "Images/hack/IMG_4454.JPG" },
    { type: "image", src: "Images/hack/IMG_4433.PNG" },
    { type: "image", src: "Images/hack/20250912_002734_916.JPG" },
    { type: "video", src: "Images/hack/1757795913997~2416418917322.MP4" },
  ];

  const tilePositions = [
    new THREE.Vector3(-2.4, 1.4, 0.06),
    new THREE.Vector3(2.4, 1.4, 0.06),
    new THREE.Vector3(-2.4, -0.4, 0.06),
    new THREE.Vector3(2.4, -0.4, 0.06),
    new THREE.Vector3(0, -2.2, 0.06),
  ];

  const hackVideos = [];

  hackItems.forEach((item, index) => {
    const tile = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 1.6),
      new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.6,
        metalness: 0.2,
      })
    );
    tile.position.copy(tilePositions[index]);
    hackWallGroup.add(tile);

    if (item.type === "image") {
      textureLoader.load(item.src, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        tile.material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.FrontSide,
          toneMapped: false,
        });

        const image = texture.image;
        if (image?.width && image?.height) {
          const aspect = image.width / image.height;
          const height = 1.6;
          const width = height * aspect;
          tile.geometry.dispose();
          tile.geometry = new THREE.PlaneGeometry(width, height);
        }
      });
    } else if (item.type === "video") {
      const video = document.createElement("video");
      video.src = item.src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;

      tile.material = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.FrontSide,
      });

      tile.geometry.dispose();
      tile.geometry = new THREE.PlaneGeometry(3.2, 1.8);

      hackVideos.push(video);
    }
  });

  group.add(hackWallGroup);

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

  // Video screen in front of the tree (initially hidden)
  const video = document.createElement('video');
  video.src = 'Wicker.mov';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  const screenGeometry = new THREE.PlaneGeometry(8, 4.5);
  const screenMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.FrontSide,
    transparent: true,
    opacity: 0, // Start invisible
  });

  const videoScreen = new THREE.Mesh(screenGeometry, screenMaterial);
  videoScreen.position.set(0, 3, -6); // In front of tree, closer to eye level
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
  frame.position.set(0, 1.6, -6.05); // Behind screen
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
  videoLight.position.set(0, 1.6, -4);
  scene.add(videoLight);

  // Store light reference
  group.userData.videoLight = videoLight;

  rooms.push({
    id: "room5",
    group,
    spawn: new THREE.Vector3(0, EYE_HEIGHT, -800),
    update: (time, delta) => {
      hackVideos.forEach((video) => {
        if (video.readyState >= 2 && video.paused) {
          video.play().catch(() => {});
        }
      });

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
