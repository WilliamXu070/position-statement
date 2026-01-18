import * as THREE from "three";

const roomAudioBuffers = new Map();
let currentRoomAudio = null;
let audioListenerInstance = null;
let audioLoaderInstance = null;

export function initAudioSystem(audioListener, audioLoader) {
  audioListenerInstance = audioListener;
  audioLoaderInstance = audioLoader;
}

export function loadRoomAudio(roomConfigs) {
  roomConfigs.forEach((config) => {
    audioLoaderInstance.load(config.audioFile, (buffer) => {
      roomAudioBuffers.set(config.id, buffer);
    }, undefined, (error) => {
      console.warn(`Failed to load audio for ${config.id}:`, error);
    });
  });
}

export function playRoomAudio(roomId) {
  // Stop current audio
  if (currentRoomAudio?.isPlaying) {
    currentRoomAudio.stop();
  }

  const buffer = roomAudioBuffers.get(roomId);
  if (buffer) {
    if (!currentRoomAudio) {
      currentRoomAudio = new THREE.Audio(audioListenerInstance);
    }
    currentRoomAudio.setBuffer(buffer);
    currentRoomAudio.setLoop(false);
    currentRoomAudio.setVolume(0.7);
    currentRoomAudio.play();
  }
}
