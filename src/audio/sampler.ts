import * as Tone from "tone";

// Add type definitions for our custom method
declare module "tone/build/esm/core/context/BaseContext" {
  interface BaseContext {
    addAudioWorklet: () => Promise<void>;
  }
}

// Import all audio files
import C1 from "../assets/salamander/C1.mp3";
import Ds1 from "../assets/salamander/Ds1.mp3";
import Fs1 from "../assets/salamander/Fs1.mp3";
import A1 from "../assets/salamander/A1.mp3";
import C2 from "../assets/salamander/C2.mp3";
import Ds2 from "../assets/salamander/Ds2.mp3";
import Fs2 from "../assets/salamander/Fs2.mp3";
import A2 from "../assets/salamander/A2.mp3";
import C3 from "../assets/salamander/C3.mp3";
import Ds3 from "../assets/salamander/Ds3.mp3";
import Fs3 from "../assets/salamander/Fs3.mp3";
import A3 from "../assets/salamander/A3.mp3";
import C4 from "../assets/salamander/C4.mp3";
import Ds4 from "../assets/salamander/Ds4.mp3";
import Fs4 from "../assets/salamander/Fs4.mp3";
import A4 from "../assets/salamander/A4.mp3";
import C5 from "../assets/salamander/C5.mp3";
import Ds5 from "../assets/salamander/Ds5.mp3";
import Fs5 from "../assets/salamander/Fs5.mp3";
import A5 from "../assets/salamander/A5.mp3";
import C6 from "../assets/salamander/C6.mp3";
import Ds6 from "../assets/salamander/Ds6.mp3";
import Fs6 from "../assets/salamander/Fs6.mp3";
import A6 from "../assets/salamander/A6.mp3";
import C7 from "../assets/salamander/C7.mp3";
import Ds7 from "../assets/salamander/Ds7.mp3";
import Fs7 from "../assets/salamander/Fs7.mp3";
import A7 from "../assets/salamander/A7.mp3";
import C8 from "../assets/salamander/C8.mp3";

let samplerLoaded = false;
let loadingPromise: Promise<void> | null = null;

export const sampler = new Tone.Sampler({
  urls: {
    C1,
    "D#1": Ds1,
    "F#1": Fs1,
    A1,
    C2,
    "D#2": Ds2,
    "F#2": Fs2,
    A2,
    C3,
    "D#3": Ds3,
    "F#3": Fs3,
    A3,
    C4,
    "D#4": Ds4,
    "F#4": Fs4,
    A4,
    C5,
    "D#5": Ds5,
    "F#5": Fs5,
    A5,
    C6,
    "D#6": Ds6,
    "F#6": Fs6,
    A6,
    C7,
    "D#7": Ds7,
    "F#7": Fs7,
    A7,
    C8,
  },
  onload: () => {
    console.log("Sampler loaded");
    console.log("Audio Context State:", Tone.getContext().state);
    samplerLoaded = true;
  },
}).toDestination();

// Enable Audio Worklet processing
Tone.getContext().addAudioWorklet = async () => {
  const context = Tone.getContext().rawContext;
  if (context.audioWorklet) {
    try {
      await context.audioWorklet.addModule(
        `data:text/javascript;charset=utf-8,
        class ToneProcessor extends AudioWorkletProcessor {
          process(inputs, outputs) {
            // Pass audio through
            const output = outputs[0];
            const input = inputs[0];
            for (let channel = 0; channel < output.length; ++channel) {
              const inputChannel = input[channel];
              const outputChannel = output[channel];
              for (let i = 0; i < outputChannel.length; ++i) {
                outputChannel[i] = inputChannel ? inputChannel[i] : 0;
              }
            }
            return true;
          }
        }
        registerProcessor('tone-processor', ToneProcessor);`
      );

      const workletNode = new AudioWorkletNode(context, "tone-processor");
      sampler.connect(workletNode);
      workletNode.connect(context.destination);
      console.log("Audio Worklet enabled successfully");
    } catch (error) {
      console.error("Failed to add Audio Worklet:", error);
    }
  }
};

const originalTriggerAttack = sampler.triggerAttack;
sampler.triggerAttack = function (...args) {
  console.log("Audio Context State:", Tone.getContext().state);
  return originalTriggerAttack.apply(this, args);
};

const originalTriggerRelease = sampler.triggerRelease;
sampler.triggerRelease = function (...args) {
  console.log("Audio Context State:", Tone.getContext().state);
  return originalTriggerRelease.apply(this, args);
};

export const getAudioContextState = () => {
  return Tone.getContext().state;
};

export const startAudioContext = async () => {
  try {
    await Tone.start();
    await Tone.getContext().addAudioWorklet();
    console.log("Audio context started successfully with Audio Worklet");
    return true;
  } catch (error) {
    console.error("Failed to start audio context:", error);
    throw error;
  }
};

export const ensureSamplerLoaded = async () => {
  if (samplerLoaded) {
    return;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve) => {
    if (sampler.loaded) {
      console.log("Sampler already loaded");
      samplerLoaded = true;
      resolve();
      return;
    }

    const checkLoaded = () => {
      if (sampler.loaded) {
        console.log("Sampler loaded successfully");
        samplerLoaded = true;
        resolve();
      } else {
        setTimeout(checkLoaded, 100);
      }
    };

    checkLoaded();
  });

  await loadingPromise;
  console.log("Sampler loaded, audio context state:", getAudioContextState());
};

export const resumeAudioContext = async () => {
  await Tone.start();
  console.log("resuming audio context");
};
