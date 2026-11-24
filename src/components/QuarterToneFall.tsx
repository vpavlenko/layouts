import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

const pixelsPerMillisecond = 0.05;
export const trailLifetime = 12_000;

export interface PlayedPitch {
  id: number;
  step: number;
  startedAt: number;
  endedAt: number | null;
}

interface QuarterToneFallProps {
  notes: PlayedPitch[];
  styleForStep: (step: number) => CSSProperties;
  octaveStarts: number[];
}

export function QuarterToneFall({ notes, styleForStep, octaveStarts }: QuarterToneFallProps) {
  const [time, setTime] = useState(() => performance.now());

  useEffect(() => {
    if (!notes.length) return;
    let frame: number;
    function advance(now: number) {
      setTime(now);
      if (notes.some(({ endedAt }) => endedAt === null || now - endedAt < trailLifetime)) {
        frame = requestAnimationFrame(advance);
      }
    }
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [notes]);

  return (
    <div className="quarter-roll" aria-hidden="true">
      {octaveStarts.map((step) => (
        <i key={step} className="quarter-roll-line" style={styleForStep(step)} />
      ))}
      {notes.map(({ id, step, startedAt, endedAt }) => {
        const age = endedAt === null ? 0 : Math.max(0, time - endedAt);
        if (age >= trailLifetime) return null;
        const duration = (endedAt ?? time) - startedAt;
        return (
          <div
            key={id}
            className="quarter-roll-note"
            data-step={step}
            style={{
              ...styleForStep(step),
              height: Math.max(4, duration * pixelsPerMillisecond),
              transform: `translate(-50%, ${age * pixelsPerMillisecond}px)`,
            }}
          />
        );
      })}
    </div>
  );
}
