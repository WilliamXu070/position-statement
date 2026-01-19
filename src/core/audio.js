import * as THREE from "three";

const roomAudioBuffers = new Map();
let currentRoomAudio = null;
let audioListenerInstance = null;
let audioLoaderInstance = null;
let currentRoomId = null;
let playbackStartTime = 0;
let pausedAt = 0;
let isPaused = false;
let bossStingBuffer = null;
let bossStingAudio = null;

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

export function loadBossSting(audioFile) {
  audioLoaderInstance.load(audioFile, (buffer) => {
    bossStingBuffer = buffer;
    console.log(`✅ Loaded boss sting: ${audioFile}`);
  }, undefined, (error) => {
    console.error(`❌ Failed to load boss sting (${audioFile}):`, error);
  });
}

export function playBossSting(durationMs = null, fadeOutMs = 50) {
  if (!bossStingBuffer) {
    console.warn("⚠️ Boss sting not loaded yet");
    return;
  }

  if (!bossStingAudio) {
    bossStingAudio = new THREE.Audio(audioListenerInstance);
  }

  if (bossStingAudio.isPlaying) {
    bossStingAudio.stop();
  }

  const now = audioListenerInstance.context.currentTime;
  bossStingAudio.setBuffer(bossStingBuffer);
  bossStingAudio.setLoop(false);
  bossStingAudio.setVolume(0.9);
  bossStingAudio.play();

  if (durationMs) {
    const durationSec = durationMs / 1000;
    const fadeSec = Math.min(fadeOutMs / 1000, durationSec);
    const fadeStart = Math.max(0, durationSec - fadeSec);
    const gain = bossStingAudio.gain.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(0.9, now);
    gain.setValueAtTime(0.9, now + fadeStart);
    gain.linearRampToValueAtTime(0, now + durationSec);
  }
}

export function stopBossSting() {
  if (bossStingAudio?.isPlaying) {
    bossStingAudio.stop();
  }
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
    currentRoomId = roomId;
    playbackStartTime = audioListenerInstance.context.currentTime;
    pausedAt = 0;
    isPaused = false;
    currentRoomAudio.play();
    console.log(`▶️ Playing audio for ${roomId}`);
  } else {
    console.warn(`⚠️ No audio buffer found for ${roomId} - still loading?`);
  }
}

export function stopRoomAudio() {
  if (currentRoomAudio?.isPlaying) {
    currentRoomAudio.stop();
  }
  pausedAt = 0;
  isPaused = false;
  playbackStartTime = audioListenerInstance?.context.currentTime ?? 0;
}

export function pauseRoomAudio() {
  if (currentRoomAudio?.isPlaying) {
    pausedAt = getRoomAudioTime();
    isPaused = true;
    currentRoomAudio.pause();
    console.log('⏸️ Paused audio');
  }
}

export function resumeRoomAudio() {
  if (currentRoomAudio && !currentRoomAudio.isPlaying && isPaused) {
    currentRoomAudio.play();
    playbackStartTime = audioListenerInstance.context.currentTime - pausedAt;
    isPaused = false;
    console.log('▶️ Resumed audio');
  }
}

export function getRoomAudioTime() {
  if (!currentRoomAudio || !audioListenerInstance) {
    return 0;
  }

  const duration = getRoomAudioDuration(currentRoomId) ?? Infinity;

  if (isPaused) {
    return Math.min(pausedAt, duration);
  }

  const elapsed = audioListenerInstance.context.currentTime - playbackStartTime;
  return Math.min(Math.max(0, elapsed), duration);
}

export function getRoomAudioDuration(roomId) {
  const buffer = roomAudioBuffers.get(roomId);
  return buffer?.duration ?? null;
}
