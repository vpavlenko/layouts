import { getAudioContext } from "./sampler";

export function createKickSound() {
  const audioContext = getAudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.1
  );

  gainNode.gain.setValueAtTime(1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.1
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}
