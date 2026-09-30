"use client";
import { useEffect, useState } from "react";
import DubPackCard from "@/components/DubPackCard";
import { CATEGORIES, PACKS, type Pack } from "@/lib/data";
import { listPublishedPacks } from "@/lib/published-packs";

export default function DubPacks() {
  const [cat, setCat] = useState("Бүгд");
  const [q, setQ] = useState("");
  const [published, setPublished] = useState<Pack[]>([]);
  useEffect(() => {
    let alive = true;
    void listPublishedPacks().then((items) => { if (alive) setPublished(items); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const list = [...published, ...PACKS].filter((p) =>
    (cat === "Бүгд" || p.category === cat || (cat === "Viral" && p.category === "Viral") ) &&
    `${p.title} ${p.description} ${p.characters.join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-black">Dub Packs</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Кино, дүр эсвэл бичлэг хайх..."
        className="chunk mt-5 w-full rounded-xl bg-white px-4 py-3 font-medium outline-none" />
      <div className="mt-5 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`chunk-sm press rounded-full px-4 py-1.5 font-bold ${cat === c ? "bg-ink text-sun" : "bg-white"}`}>{c}</button>
        ))}
      </div>
      {list.length === 0 ? <p className="mt-10 font-bold">Илэрц олдсонгүй. Өөр үгээр хайж үзээрэй.</p> : (
        <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] justify-items-center gap-6">
          {list.map((p) => <DubPackCard key={p.slug} pack={p} />)}
        </div>
      )}
    </main>
  );
}
