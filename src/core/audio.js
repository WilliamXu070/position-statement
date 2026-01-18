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
      console.log(`✅ Loaded audio for ${config.id}: ${config.audioFile}`);
    }, undefined, (error) => {
      console.error(`❌ Failed to load audio for ${config.id} (${config.audioFile}):`, error);
    });
  });
}

export function playRoomAudio(roomId) {
  // Stop current audio
  if (currentRoomAudio?.isPlaying) {
    currentRoomAudio.stop();
    console.log('⏹️ Stopped previous audio');
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
    console.log(`▶️ Playing audio for ${roomId}`);
  } else {
    console.warn(`⚠️ No audio buffer found for ${roomId} - still loading?`);
  }
}

export function pauseRoomAudio() {
  if (currentRoomAudio?.isPlaying) {
    currentRoomAudio.pause();
    console.log('⏸️ Paused audio');
  }
}

export function resumeRoomAudio() {
  if (currentRoomAudio && !currentRoomAudio.isPlaying) {
    currentRoomAudio.play();
    console.log('▶️ Resumed audio');
  }
}
