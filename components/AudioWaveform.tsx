"use client";

import WaveSurfer from "wavesurfer.js";
import { useEffect, useRef } from "react";

export default function AudioWaveform({ src, color, progressColor, onSeek }: { src: string; color: string; progressColor: string; onSeek?: (time: number) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const onSeekRef = useRef(onSeek);

  useEffect(() => {
    onSeekRef.current = onSeek;
  }, [onSeek]);

  useEffect(() => {
    if (!container.current || !src) return;
    const wavesurfer = WaveSurfer.create({
      container: container.current,
      url: src,
      height: 66,
      waveColor: color,
      progressColor,
      cursorColor: "#ffc93c",
      cursorWidth: 2,
      barWidth: 3,
      barGap: 2,
      barRadius: 2,
      normalize: true,
      interact: true,
      dragToSeek: true,
    });
    wavesurfer.on("interaction", (time) => onSeekRef.current?.(time));
    return () => wavesurfer.destroy();
  }, [src, color, progressColor]);

  return <div ref={container} className="min-h-[66px] w-full" aria-label="Audio waveform" />;
}