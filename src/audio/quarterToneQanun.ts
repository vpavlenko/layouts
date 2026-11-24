// Original CC0 slices with Rawl's playback pitch calibration. See public/kanun-sources.txt.
const files = import.meta.glob<string>("../assets/qanun/*.m4a", {
  eager: true,
  query: "?url",
  import: "default",
});

const samples = [
  [53, "F3", 9],
  [55, "G3", 9],
  [57, "A3", 1],
  [59, "B3", -14],
  [61, "Cs4", 2],
  [63, "Ds4", 4],
  [65, "F4", 4],
  [67, "G4", 5],
  [69, "A4", 5],
  [71, "B4", -8],
  [73, "Cs5", 22],
  [75, "Ds5", 12],
  [77, "F5", 9],
  [79, "G5", 4],
  [81, "A5", -6],
  [83, "B5", -27],
] as const;

type QanunSample = (typeof samples)[number];
const downloads = new Map<number, Promise<ArrayBuffer>>();
const recordings = new Map<number, Promise<{ buffer: AudioBuffer; gain: number }>>();
const playing = new Set<() => void>();
let context: AudioContext | undefined;

function nearestSample(step: number) {
  const midi = step / 2;
  return samples.reduce((nearest, candidate) =>
    Math.abs(candidate[0] - midi) < Math.abs(nearest[0] - midi) ? candidate : nearest
  );
}

function download([midi, name]: QanunSample) {
  let pending = downloads.get(midi);
  if (!pending) {
    pending = fetch(files[`../assets/qanun/qanun-${name}.m4a`]).then((response) => {
      if (!response.ok) throw new Error(`Kanun sample: HTTP ${response.status}`);
      return response.arrayBuffer();
    }).catch((error) => {
      downloads.delete(midi);
      throw error;
    });
    downloads.set(midi, pending);
  }
  return pending;
}

export function prepareQanun(steps: number[]) {
  for (const sample of new Set(steps.map(nearestSample))) {
    void download(sample).catch(() => undefined);
  }
}

function recording(audio: AudioContext, sample: QanunSample) {
  const [midi] = sample;
  let pending = recordings.get(midi);
  if (!pending) {
    pending = download(sample).then(async (data) => {
      const buffer = await audio.decodeAudioData(data.slice(0));
      let peak = 0;
      for (const value of buffer.getChannelData(0)) peak = Math.max(peak, Math.abs(value));
      return { buffer, gain: peak > 0 ? 0.28 / peak : 1 };
    }).catch((error) => {
      recordings.delete(midi);
      downloads.delete(midi);
      throw error;
    });
    recordings.set(midi, pending);
  }
  return pending;
}

export function playQanunPitch(step: number, onError: () => void) {
  let stop: (() => void) | undefined;
  let cancelled = false;

  function cancel() {
    if (cancelled) return;
    cancelled = true;
    playing.delete(cancel);
    stop?.();
  }

  async function start() {
    try {
      const audio = context ??= new AudioContext();
      const sample = nearestSample(step);
      const [midi, , cents] = sample;
      const [, { buffer, gain: level }] = await Promise.all([audio.resume(), recording(audio, sample)]);
      if (cancelled) return;
      const source = audio.createBufferSource();
      const gain = audio.createGain();
      source.buffer = buffer;
      source.playbackRate.value = 2 ** ((step / 2 - midi + cents / 100) / 12);
      const startTime = audio.currentTime;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(level, startTime + 0.003);
      source.connect(gain).connect(audio.destination);
      source.onended = () => {
        playing.delete(cancel);
        source.disconnect();
        gain.disconnect();
        stop = undefined;
      };
      stop = () => {
        const now = audio.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.035);
        source.stop(now + 0.035);
      };
      // The pluck continues to the end of its recording after key release.
      source.start(startTime);
    } catch {
      playing.delete(cancel);
      if (!cancelled) onError();
    }
  }

  playing.add(cancel);
  void start();
  return cancel;
}

export function stopQanun() {
  for (const cancel of playing) cancel();
}
