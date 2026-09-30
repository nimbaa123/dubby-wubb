"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Pack } from "@/lib/data";
import FinishScreen from "./FinishScreen";
import AudioWaveform from "./AudioWaveform";

export type Rec = { blob: Blob; url: string };
const BARS = 32;

export default function Studio({ pack }: { pack: Pack }) {
  const [i, setI] = useState(0);
  const [recs, setRecs] = useState<Record<string, Rec>>({});
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(BARS).fill(0.1));
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [sourceWave, setSourceWave] = useState<{ lineId: string; url: string }>();
  const video = useRef<HTMLVideoElement>(null);
  const stopRec = useRef<() => void>(() => {});
  const cleanup = useRef<() => void>(() => {});
  const sourceRecorder = useRef<MediaRecorder | null>(null);
  const takeAudio = useRef<HTMLAudioElement | null>(null);
  const recUrls = useRef(new Set<string>());
  const sourceWaveUrl = useRef("");
  const line = pack.lines[i];
  const has = !!recs[line.id];
  const state = recording ? "RECORDING" : has ? "RECORDED" : "READY";
  const dur = line.endTime - line.startTime;

  useEffect(() => {
    cleanup.current();
    sourceRecorder.current?.stop();
    sourceRecorder.current = null;
    const el = video.current;
    if (el) { el.pause(); el.currentTime = line.startTime; }
  }, [i, line.startTime]);

  useEffect(() => () => {
    cleanup.current();
    sourceRecorder.current?.stop();
    recUrls.current.forEach((url) => URL.revokeObjectURL(url));
    if (sourceWaveUrl.current) URL.revokeObjectURL(sourceWaveUrl.current);
  }, []);

  // Plays only startTime -> endTime, then stops.
  const playRange = (muted: boolean, onEnd?: () => void) => {
    const el = video.current;
    if (!el) return;
    cleanup.current();
    el.muted = muted;
    el.currentTime = line.startTime;
    void el.play();
    const check = () => {
      if (el.currentTime >= line.endTime) { finish(); onEnd?.(); }
    };
    const finish = () => { el.pause(); el.removeEventListener("timeupdate", check); };
    el.addEventListener("timeupdate", check);
    cleanup.current = finish;
  };

  const captureSourceWave = () => {
    const el = video.current as (HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream }) | null;
    const stream = el?.captureStream?.() ?? el?.mozCaptureStream?.();
    const audioTracks = stream?.getAudioTracks() ?? [];
    if (!audioTracks.length || typeof MediaRecorder === "undefined") return;
    const audioStream = new MediaStream(audioTracks);
    const recorder = new MediaRecorder(audioStream);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = () => {
      audioTracks.forEach((track) => track.stop());
      if (!chunks.length) return;
      const url = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType }));
      if (sourceWaveUrl.current) URL.revokeObjectURL(sourceWaveUrl.current);
      sourceWaveUrl.current = url;
      setSourceWave((previous) => {
        return { lineId: line.id, url };
      });
    };
    recorder.start();
    sourceRecorder.current = recorder;
  };

  const playOriginal = () => {
    captureSourceWave();
    playRange(false, () => {
      if (sourceRecorder.current?.state === "recording") sourceRecorder.current.stop();
    });
  };

  const playMine = () => {
    const r = recs[line.id];
    if (!r) return;
    const a = new Audio(r.url);
    takeAudio.current = a;
    playRange(true, () => a.pause());
    void a.play();
    const prev = cleanup.current;
    cleanup.current = () => { prev(); a.pause(); };
  };

  const startRec = async () => {
    setErr("");
    cleanup.current();
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErr("Таны хөтөч бичлэг хийх боломжгүй байна. Chrome эсвэл Safari ашиглана уу.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const an = ctx.createAnalyser();
      an.fftSize = 128;
      ctx.createMediaStreamSource(stream).connect(an);
      const data = new Uint8Array(an.frequencyBinCount);
      const m = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      const t0 = performance.now();
      let raf = 0;
      const tick = () => {
        an.getByteFrequencyData(data);
        setLevels(Array.from({ length: BARS }, (_, k) => Math.max(0.08, data[k] / 255)));
        setElapsed((performance.now() - t0) / 1000);
        raf = requestAnimationFrame(tick);
      };
      m.ondataavailable = (e) => chunks.push(e.data);
      m.onstop = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
        video.current?.pause();
        cleanup.current();
        if (!chunks.length) { setErr("Бичлэг хадгалахад алдаа гарлаа."); setRecording(false); return; }
        const blob = new Blob(chunks, { type: m.mimeType });
        const url = URL.createObjectURL(blob);
        const previousUrl = recs[line.id]?.url;
        if (previousUrl) { URL.revokeObjectURL(previousUrl); recUrls.current.delete(previousUrl); }
        recUrls.current.add(url);
        setRecs((r) => ({ ...r, [line.id]: { blob, url } }));
        setRecording(false);
        setLevels(Array(BARS).fill(0.1));
      };
      stopRec.current = () => { if (m.state !== "inactive") m.stop(); };
      m.start();
      setRecording(true);
      tick();
      playRange(true, () => stopRec.current()); // original audio muted while recording
    } catch {
      setErr("Микрофонд хандах эрх шаардлагатай.");
    }
  };

  const remove = () => {
    const url = recs[line.id]?.url;
    if (url) { URL.revokeObjectURL(url); recUrls.current.delete(url); }
    setRecs((r) => { const n = { ...r }; delete n[line.id]; return n; });
  };
  const doneCount = Object.keys(recs).length;

  if (done) return <FinishScreen pack={pack} recs={recs} onRestart={() => { setRecs({}); setI(0); setDone(false); }} />;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dub-packs" className="rounded-lg bg-cream/10 px-3 py-2 font-bold hover:bg-cream/20">← Буцах</Link>
          <span className="font-display text-xs font-black text-teal">DUBBY-WUBB / DUB STAGE</span>
          <span className="ml-auto font-bold">{pack.title} · Мөр {i + 1} / {pack.lines.length}</span>
        </div>

        <div className="mt-2 flex items-center gap-3" role="progressbar" aria-valuenow={doneCount} aria-valuemax={pack.lines.length}>
          <div className="flex h-3 flex-1 gap-1">
            {pack.lines.map((l, k) => <span key={l.id} className={`flex-1 rounded-sm ${recs[l.id] ? "bg-teal" : k === i ? "bg-sun" : "bg-cream/20"}`} />)}
          </div>
          <span className="text-sm font-bold">{doneCount} / {pack.lines.length}</span>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative overflow-hidden rounded-2xl border-[3px] border-cream/80 bg-black">
            <video ref={video} src={pack.videoUrl} playsInline preload="auto" className="aspect-video w-full"
              onLoadedMetadata={(e) => { e.currentTarget.currentTime = line.startTime; setLoading(false); }} onError={() => setErr("Видео ачаалахад алдаа гарлаа.")} />
            {loading && <div className="absolute inset-0 grid place-items-center bg-black/70 font-bold">Видео ачаалж байна...</div>}
            <span className="absolute left-3 top-3 rounded-full bg-sun px-3 py-1 text-sm font-black text-ink">{line.character}</span>
            {recording && <span className="absolute right-3 top-3 animate-pulse rounded-full bg-coral px-3 py-1 text-sm font-black">● REC</span>}
          </div>

          <div className="flex flex-col rounded-2xl border-[3px] border-cream/80 p-5">
            <p className="text-xs font-black text-teal">ТАНЫ ЯРИА</p>
            <p className="mt-2 font-display text-2xl font-black leading-snug">“{line.text}”</p>
            <p className="mt-3 text-sm text-cream/70">Эхлээд сонсоод, дараа нь ижил хэмнэлээр хэлээрэй.</p>
            <div className="mt-auto pt-5">
              <div className="flex h-16 items-end gap-1" aria-hidden>
                {levels.map((l, k) => <span key={k} className={`flex-1 rounded-sm ${recording ? "bg-coral" : "bg-cream/25"}`} style={{ height: `${l * 100}%` }} />)}
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm font-bold tabular-nums">
                <span>{Math.min(elapsed, dur).toFixed(1)}s</span>
                <span className="h-1 flex-1 rounded bg-cream/20"><span className="block h-1 rounded bg-sun" style={{ width: `${Math.min(100, (elapsed / dur) * 100)}%` }} /></span>
                <span>{dur.toFixed(1)}s</span>
              </div>
              <p className="mt-2 text-xs font-black">{state === "READY" ? "READY" : state === "RECORDING" ? "RECORDING" : "RECORDED ✓"}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <section className="min-w-0 rounded-xl border-2 border-cream/20 px-4 py-3">
            <div className="flex items-center justify-between gap-2"><h2 className="text-xs font-black tracking-wide text-teal">ORIGINAL</h2><span className="text-xs tabular-nums text-cream/55">{line.startTime.toFixed(2)}–{line.endTime.toFixed(2)}s</span></div>
            {sourceWave?.lineId === line.id
              ? <AudioWaveform src={sourceWave.url} color="#fff8e7" progressColor="#19c3b1" onSeek={(time) => { if (video.current) video.current.currentTime = line.startTime + time; }} />
              : <div className="grid h-[66px] place-items-center text-xs text-cream/45">Эх хувилбарыг тоглуулахад waveform үүснэ</div>}
          </section>
          <section className="min-w-0 rounded-xl border-2 border-cream/20 px-4 py-3">
            <div className="flex items-center justify-between gap-2"><h2 className="text-xs font-black tracking-wide text-coral">YOUR VOICE</h2><span className="text-xs tabular-nums text-cream/55">{has ? `${dur.toFixed(1)}s` : "Бичлэг хийгээгүй"}</span></div>
            {has
              ? <AudioWaveform src={recs[line.id].url} color="#fff8e7" progressColor="#ff5a4e" onSeek={(time) => { if (takeAudio.current) takeAudio.current.currentTime = time; }} />
              : <div className="grid h-[66px] place-items-center text-xs text-cream/45">Бичлэгийн дараа waveform энд харагдана</div>}
          </section>
        </div>

        {err && <p role="alert" className="mt-4 rounded-xl bg-coral p-3 font-bold">{err}</p>}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Ctl onClick={playOriginal} disabled={recording} color="bg-teal text-ink" title="▶ ORIGINAL" sub="Эх яриаг сонсох" />
          {recording
            ? <Ctl onClick={() => stopRec.current()} color="bg-cream text-ink" title="■ STOP RECORDING" sub={`${elapsed.toFixed(1)}s`} />
            : <Ctl onClick={startRec} color="bg-coral text-white" title={has ? "● RE-RECORD" : "● RECORD"} sub="Микрофоноо ашиглах" />}
          <Ctl onClick={playMine} disabled={!has || recording} color="bg-sun text-ink" title="▶ MY TAKE" sub="Бичлэгээ дахин сонсох" />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={() => setI(i - 1)} disabled={i === 0 || recording} className="rounded-xl bg-cream/10 px-5 py-3 font-black disabled:opacity-30">← ӨМНӨХ</button>
          {has && !recording && <button onClick={remove} className="rounded-xl bg-cream/10 px-5 py-3 font-bold">🗑 Устгах</button>}
          {i < pack.lines.length - 1
            ? <button onClick={() => setI(i + 1)} disabled={!has || recording} className="ml-auto rounded-xl bg-sun px-6 py-3 font-black text-ink disabled:opacity-30">ДАРААХ →</button>
            : <button onClick={() => setDone(true)} disabled={doneCount < pack.lines.length || recording} className="ml-auto rounded-xl bg-teal px-6 py-3 font-black text-ink disabled:opacity-30">ДУУСГАХ ✓</button>}
        </div>
      </div>
    </main>
  );
}

function Ctl({ onClick, disabled, color, title, sub }: { onClick: () => void; disabled?: boolean; color: string; title: string; sub: string }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`press rounded-2xl border-[3px] border-cream p-4 text-left shadow-[4px_4px_0_#fff8e7] disabled:opacity-40 ${color}`}>
      <span className="block font-display text-sm font-black">{title}</span>
      <span className="text-sm font-medium opacity-80">{sub}</span>
    </button>
  );
}
