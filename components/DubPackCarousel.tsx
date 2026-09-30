"use client";
import { useRef } from "react";
import DubPackCard from "./DubPackCard";
import { PACKS } from "@/lib/data";

export default function DubPackCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * 300, behavior: "smooth" });
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl font-black sm:text-3xl">Шинээр нэмэгдсэн</h2>
        <div className="flex gap-2">
          {[-1, 1].map((d) => (
            <button key={d} onClick={() => scroll(d)} aria-label={d < 0 ? "Зүүн" : "Баруун"} className="chunk-sm press h-10 w-10 rounded-full bg-sun font-black">{d < 0 ? "←" : "→"}</button>
          ))}
        </div>
      </div>
      <div ref={ref} className="no-scrollbar flex gap-5 overflow-x-auto pb-4 pr-2 pt-1">
        {PACKS.map((p) => <DubPackCard key={p.slug} pack={p} />)}
      </div>
    </section>
  );
}
