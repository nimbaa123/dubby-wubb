"use client";
import { useRef, useState } from "react";
import type { Pack } from "@/lib/data";
import type { Rec } from "./Studio";
import { mixToWav } from "@/lib/mix";

export default function FinishScreen({ pack, recs, onRestart }: { pack: Pack; recs: Record<string, Rec>; onRestart: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const stop = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Replays the whole scene: original video with dialogue muted, user's takes played at each line.
  const playAll = async () => {
    const el = video.current;
    if (!el) return;
    stop.current = false;
    setPlaying(true);
    el.muted = true;
    for (const l of pack.lines) {
      if (stop.current) break;
      el.currentTime = l.startTime;
      const a = new Audio(recs[l.id].url);
      await el.play();
      await a.play();
      await new Promise<void>((res) => {
        const t = setInterval(() => { if (stop.current || el.currentTime >= l.endTime + 0.3) { clearInterval(t); res(); } }, 100);
      });
      a.pause();
    }
    el.pause();
    setPlaying(false);
  };

  const download = async () => {
    setBusy(true); setMsg("Бичлэг боловсруулж байна...");
    try {
      const firstTime = Math.min(...pack.lines.map((line) => line.startTime));
      const lastTime = Math.max(...pack.lines.map((line) => line.endTime));
      const total = lastTime - firstTime + 0.5;
      const wav = await mixToWav(pack.lines.map((l) => ({ blob: recs[l.id].blob, start: l.startTime - firstTime })), total);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(wav);
      a.download = `${pack.slug}-dub.wav`;
      a.click();
      setMsg("Таны дууны бичлэг татагдлаа.");
    } catch { setMsg("Бичлэг хадгалахад алдаа гарлаа."); }
    setBusy(false);
  };

  const share = async () => {
    const data = { title: "Dubby-Wubb", text: `Би "${pack.title}" дээр дуу оруулчихлаа!`, url: location.origin + `/play/${pack.slug}` };
    if (navigator.share) { try { await navigator.share(data); } catch {} }
    else { await navigator.clipboard.writeText(data.url); setMsg("Холбоос хуулагдлаа."); }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-ink px-4 py-10 text-cream">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-3xl font-black sm:text-4xl">🎉 Дуб амжилттай!</h1>
        <p className="mt-2 text-cream/80">Чи бүх яриагаа амжилттай бичиж дуусгалаа.</p>
        <video ref={video} src={pack.videoUrl} playsInline onLoadedMetadata={(e) => (e.currentTarget.currentTime = pack.lines[0].startTime)}
          className="mt-6 aspect-video w-full rounded-2xl border-[3px] border-cream/80 bg-black" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button onClick={playing ? () => { stop.current = true; } : playAll} className="press rounded-xl bg-sun p-4 font-display font-black text-ink">{playing ? "■ ЗОГСООХ" : "▶ БҮТЭН БИЧЛЭГ ҮЗЭХ"}</button>
          <button onClick={onRestart} className="press rounded-xl bg-cream p-4 font-display font-black text-ink">↻ ДАХИН ТОГЛОХ</button>
          <button onClick={download} disabled={busy} className="press rounded-xl bg-teal p-4 font-display font-black text-ink disabled:opacity-50">⬇ ТАТАХ</button>
          <button onClick={share} className="press rounded-xl bg-coral p-4 font-display font-black text-white">↗ ХУВААЛЦАХ</button>
        </div>
        {msg && <p role="status" className="mt-4 font-bold text-teal">{msg}</p>}
      </div>
    </main>
  );
}
