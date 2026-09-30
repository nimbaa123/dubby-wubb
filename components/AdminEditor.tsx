"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Line, Pack } from "@/lib/data";
import { CATEGORIES } from "@/lib/data";
import { savePublishedPack } from "@/lib/published-packs";

const freshLine = () => ({ character: "", text: "", startTime: "", endTime: "" });

export default function AdminEditor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Кино");
  const [lineDraft, setLineDraft] = useState(freshLine);
  const [lines, setLines] = useState<Line[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [publishedSlug, setPublishedSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const setTime = (field: "startTime" | "endTime") => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    setLineDraft((draft) => ({ ...draft, [field]: time.toFixed(2) }));
  };

  const addLine = () => {
    const startTime = Number(lineDraft.startTime);
    const endTime = Number(lineDraft.endTime);
    if (!lineDraft.character.trim() || !lineDraft.text.trim() || !lineDraft.startTime || !lineDraft.endTime || !Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
      setNotice("Дүр, яриа болон зөв эхлэх/дуусах хугацааг оруулна уу.");
      return;
    }
    if (editingId) {
      setLines((items) => items.map((item) => item.id === editingId ? { ...item, character: lineDraft.character.trim(), text: lineDraft.text.trim(), startTime, endTime } : item));
      setEditingId(null);
    } else {
      setLines((items) => [...items, { id: crypto.randomUUID(), character: lineDraft.character.trim(), text: lineDraft.text.trim(), startTime, endTime }].sort((a, b) => a.startTime - b.startTime));
    }
    setLineDraft(freshLine());
    setNotice("");
  };

  const editLine = (line: Line) => {
    setEditingId(line.id);
    setLineDraft({ character: line.character, text: line.text, startTime: String(line.startTime), endTime: String(line.endTime) });
  };

  const publish = async () => {
    if (!videoFile || !title.trim() || lines.length === 0) {
      setNotice("Нэр, MP4 видео болон дор хаяж нэг ярианы мөр хэрэгтэй.");
      return;
    }
    const slug = title.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || `dub-${Date.now()}`;
    const firstTime = Math.min(...lines.map((line) => line.startTime));
    const lastTime = Math.max(...lines.map((line) => line.endTime));
    const pack: Pack = {
      slug, title: title.trim(), description: description.trim(), category, language: "Монгол",
      duration: lastTime - firstTime, difficulty: "Амархан",
      videoUrl, emoji: "🎬", color: "#19c3b1", isNew: true,
      characters: [...new Set(lines.map((line) => line.character))], lines,
    };
    setBusy(true);
    try {
      await savePublishedPack(pack, videoFile);
      setPublishedSlug(slug);
      setNotice(`“${pack.title}” Dub Pack нийтлэгдлээ.`);
    } catch {
      setNotice("Хадгалахад алдаа гарлаа. Хөтчийн санах ойг шалгаад дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  };

  const moveLine = (index: number, direction: -1 | 1) => setLines((items) => {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return items;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });

  return (
    <main className="min-h-[calc(100vh-64px)] bg-cream px-4 py-8 text-ink">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-5">
          <div><p className="font-display text-xs font-black text-teal">DUBBY-WUBB / ADMIN STUDIO</p><h1 className="mt-2 font-display text-3xl font-black">Dub Pack editor</h1><p className="mt-1 text-sm text-ink/65">Видеоныхоо ярианы хэсгийг тэмдэглээд мөрүүдээ үүсгээрэй.</p></div>
          <Link href="/dub-packs" className="chunk-sm press rounded-lg bg-white px-4 py-2 text-sm font-black">Dub Packs үзэх</Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section>
            <div className="flex items-center justify-between"><h2 className="font-display text-lg font-black">01 · Видео</h2><button onClick={() => fileRef.current?.click()} className="press rounded-lg bg-sun px-4 py-2 text-sm font-black">MP4 сонгох</button><input ref={fileRef} className="hidden" type="file" accept="video/mp4,video/*" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setVideoFile(file);
              setVideoUrl(URL.createObjectURL(file));
              setNotice("");
            }} /></div>
            <div className="mt-3 overflow-hidden rounded-lg border-[3px] border-ink bg-ink">
              {videoUrl ? <video ref={videoRef} src={videoUrl} controls playsInline className="aspect-video w-full" onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} /> : <button onClick={() => fileRef.current?.click()} className="grid aspect-video w-full place-items-center text-cream"><span><span className="block text-4xl">＋</span><span className="mt-2 block font-bold">MP4 видеоо энд нэмнэ үү</span></span></button>}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-ink/60"><span>{videoFile ? videoFile.name : "MP4 видео сонгоогүй"}</span><span className="ml-auto">Одоогийн байрлал: {currentTime.toFixed(2)} сек</span></div>
          </section>

          <section className="rounded-lg border-2 border-ink/15 bg-white p-4">
            <h2 className="font-display text-lg font-black">02 · Pack мэдээлэл</h2>
            <label className="mt-4 block text-xs font-black">PACK НЭР<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-md border-2 border-ink/20 px-3 py-2 text-sm" placeholder="Жишээ: Говийн адал явдал" /></label>
            <label className="mt-3 block text-xs font-black">ТАЙЛБАР<textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 min-h-20 w-full rounded-md border-2 border-ink/20 px-3 py-2 text-sm" placeholder="Энэ хэсэгт юу болох вэ?" /></label>
            <label className="mt-3 block text-xs font-black">АНГИЛАЛ<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full rounded-md border-2 border-ink/20 bg-white px-3 py-2 text-sm">{CATEGORIES.filter((item) => item !== "Бүгд").map((item) => <option key={item}>{item}</option>)}</select></label>
          </section>
        </div>

        <section className="mt-8 border-t-2 border-ink/15 pt-6">
          <h2 className="font-display text-lg font-black">03 · Ярианы мөр үүсгэх</h2><p className="mt-1 text-sm text-ink/65">Видеогоо тоглуулаад дүр ярьж эхлэх, дуусах мөч дээр товч дарна.</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border-2 border-ink/15 p-3"><span className="text-[11px] font-black text-ink/55">ЭХЛЭХ ЦАГ</span><div className="mt-1 font-display text-2xl font-black tabular-nums">{lineDraft.startTime || "--.--"}<span className="ml-1 text-sm">сек</span></div><button onClick={() => setTime("startTime")} disabled={!videoFile} className="mt-3 w-full rounded-md bg-teal px-3 py-2 text-xs font-black disabled:opacity-40">SET START</button></div>
              <div className="rounded-lg border-2 border-ink/15 p-3"><span className="text-[11px] font-black text-ink/55">ДУУСАХ ЦАГ</span><div className="mt-1 font-display text-2xl font-black tabular-nums">{lineDraft.endTime || "--.--"}<span className="ml-1 text-sm">сек</span></div><button onClick={() => setTime("endTime")} disabled={!videoFile} className="mt-3 w-full rounded-md bg-coral px-3 py-2 text-xs font-black text-white disabled:opacity-40">SET END</button></div>
              <label className="text-xs font-black">ДҮРИЙН НЭР<input value={lineDraft.character} onChange={(event) => setLineDraft((draft) => ({ ...draft, character: event.target.value }))} className="mt-1 w-full rounded-md border-2 border-ink/20 px-3 py-2 text-sm" placeholder="Туулай" /></label>
              <label className="text-xs font-black">ЯРИА<textarea value={lineDraft.text} onChange={(event) => setLineDraft((draft) => ({ ...draft, text: event.target.value }))} className="mt-1 min-h-10 w-full resize-y rounded-md border-2 border-ink/20 px-3 py-2 text-sm" placeholder="Энд хэлэх үгээ бичнэ" /></label>
            </div>
            <div>
              <button onClick={addLine} className="press w-full rounded-lg bg-ink px-4 py-3 font-display text-sm font-black text-cream">{editingId ? "ӨӨРЧЛӨЛТ ХАДГАЛАХ" : "＋ ADD LINE"}</button>
              <div className="mt-3 space-y-2">
                {lines.length === 0 && <p className="rounded-lg border-2 border-dashed border-ink/20 px-4 py-6 text-center text-sm text-ink/55">Үүсгэсэн мөр одоогоор алга.</p>}
                {lines.map((line, index) => <article key={line.id} className="flex items-center gap-3 rounded-lg border-2 border-ink/10 bg-white p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sun font-display text-sm font-black">{index + 1}</span>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap gap-x-2 text-xs font-black"><span>{line.character}</span><span className="text-ink/45">{line.startTime.toFixed(2)}–{line.endTime.toFixed(2)}s</span></div><p className="truncate text-sm">{line.text}</p></div>
                  <div className="flex gap-1"><button title="Дээш" aria-label="Дээш" onClick={() => moveLine(index, -1)} disabled={index === 0} className="rounded bg-cream px-2 py-1 font-bold disabled:opacity-30">↑</button><button title="Доош" aria-label="Доош" onClick={() => moveLine(index, 1)} disabled={index === lines.length - 1} className="rounded bg-cream px-2 py-1 font-bold disabled:opacity-30">↓</button><button title="Засах" aria-label="Засах" onClick={() => editLine(line)} className="rounded bg-cream px-2 py-1 font-bold">✎</button><button title="Устгах" aria-label="Устгах" onClick={() => setLines((items) => items.filter((item) => item.id !== line.id))} className="rounded bg-coral/10 px-2 py-1 font-bold text-coral">×</button></div>
                </article>)}
              </div>
            </div>
          </div>
        </section>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink/15 pt-5">{notice && <div><p role="status" className="text-sm font-bold">{notice}</p>{publishedSlug && <Link href={`/play/${publishedSlug}`} className="mt-1 inline-block text-sm font-black text-teal underline">Pack тоглуулах →</Link>}</div>}<button onClick={publish} disabled={busy} className="press ml-auto rounded-lg bg-sun px-7 py-3 font-display text-sm font-black disabled:opacity-50">{busy ? "Нийтэлж байна..." : "PUBLISH DUB PACK →"}</button></div>
      </div>
    </main>
  );
}