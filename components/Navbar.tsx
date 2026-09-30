"use client";
import Link from "next/link";
import { useState } from "react";

const LINKS = [
  ["Тоглох", "/dub-packs"], ["Олон тоглогч", "/multiplayer"], ["Үүсгэх", "/create"],
  ["Dub Packs", "/dub-packs"], ["Үнэ", "/pricing"],
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("MN");
  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-ink bg-sun">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="font-display text-xl font-black tracking-tight">
          Dubby<span className="mx-0.5 inline-block rotate-6 rounded bg-ink px-1.5 text-sun">-</span>Wubb
        </Link>
        <nav className="hidden flex-1 justify-center gap-6 font-bold lg:flex">
          {LINKS.map(([t, h]) => <Link key={t} href={h} className="hover:underline decoration-[3px] underline-offset-4">{t}</Link>)}
        </nav>
        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <button onClick={() => setLang(lang === "MN" ? "EN" : "MN")} className="chunk-sm press rounded-lg bg-cream px-2 py-1 text-sm font-bold" aria-label="Хэл солих">
            {lang === "MN" ? "MN | en" : "mn | EN"}
          </button>
          <Link href="/login" className="font-bold">Нэвтрэх</Link>
          <Link href="/signup" className="chunk-sm press rounded-lg bg-ink px-4 py-2 font-bold text-sun">Бүртгүүлэх</Link>
        </div>
        <button className="chunk-sm ml-auto rounded-lg bg-cream px-3 py-2 font-bold lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Цэс">
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <div className="flex flex-col gap-1 border-t-[3px] border-ink bg-cream p-4 font-bold lg:hidden">
          {[...LINKS, ["Нэвтрэх", "/login"], ["Бүртгүүлэх", "/signup"]].map(([t, h]) => (
            <Link key={t} href={h} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 hover:bg-sun">{t}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
