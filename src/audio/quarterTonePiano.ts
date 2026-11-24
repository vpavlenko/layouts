import { pianoSamples } from "./pianoSamples";

const sampleNotes = Object.keys(pianoSamples).map(Number);
const downloads = new Map<number, Promise<ArrayBuffer>>();
const recordings = new Map<number, Promise<AudioBuffer>>();
let context: AudioContext | undefined;

function nearestSample(step: number) {
  const midi = step / 2;
  return sampleNotes.reduce((nearest, candidate) =>
    Math.abs(candidate - midi) < Math.abs(nearest - midi) ? candidate : nearest
  );
}

function download(note: number) {
  let pending = downloads.get(note);
  if (!pending) {
    pending = fetch(pianoSamples[note]).then((response) => {
      if (!response.ok) throw new Error(`Piano sample: ${response.status}`);
      return response.arrayBuffer();
    }).catch((error) => {
      downloads.delete(note);
      throw error;
    });
    downloads.set(note, pending);
  }
  return pending;
}

export function prepareQuarterTonePiano(steps: number[]) {
  for (const note of new Set(steps.map(nearestSample))) {
    void download(note).catch(() => undefined);
  }
}

function recording(audio: AudioContext, note: number) {
  let pending = recordings.get(note);
  if (!pending) {
    pending = download(note).then((bytes) => audio.decodeAudioData(bytes.slice(0))).catch((error) => {
      recordings.delete(note);
      downloads.delete(note);
      throw error;
    });
    recordings.set(note, pending);
  }
  return pending;
}

export function playQuarterTone(step: number, onError: () => void) {
  let voice: { source: AudioBufferSourceNode; gain: GainNode; started: number } | undefined;
  let released = false;
  let cancelled = false;

  function stop() {
    if (!voice || !context) return;
    const { source, gain, started } = voice;
    const end = cancelled ? context.currentTime : Math.max(context.currentTime, started + 0.12);
    gain.gain.setValueAtTime(gain.gain.value, end);
    gain.gain.linearRampToValueAtTime(0, end + 0.12);
    source.stop(end + 0.12);
    voice = undefined;
  }

  async function start() {
    try {
      const audio = context ??= new AudioContext();
      const note = nearestSample(step);
      const [, buffer] = await Promise.all([audio.resume(), recording(audio, note)]);
      if (cancelled) return;
      const source = audio.createBufferSource();
      const gain = audio.createGain();
      source.buffer = buffer;
      // A step is 50 cents. Each pitch has its own voice and release.
      source.playbackRate.value = 2 ** ((step / 2 - note) / 12);
      gain.gain.value = 0.34;
      source.connect(gain).connect(audio.destination);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
        voice = undefined;
      };
      const started = audio.currentTime;
      voice = { source, gain, started };
      source.start(started);
      if (released) stop();
    } catch {
      if (!cancelled) onError();
    }
  }

  void start();
  return {
    release() {
      released = true;
      stop();
    },
    cancel() {
      cancelled = true;
      stop();
    },
  };
}
