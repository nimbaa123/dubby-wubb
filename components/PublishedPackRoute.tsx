"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Pack } from "@/lib/data";
import { loadPublishedPack } from "@/lib/published-packs";
import Studio from "@/components/Studio";

export default function PublishedPackRoute({ slug }: { slug: string }) {
  const [pack, setPack] = useState<Pack>();
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let alive = true;
    void loadPublishedPack(slug).then((stored) => {
      if (!alive) return;
      if (stored) setPack(stored);
      else setMissing(true);
    }).catch(() => setMissing(true));
    return () => { alive = false; };
  }, [slug]);

  if (pack) return <Studio pack={pack} />;
  return <main className="grid min-h-[70vh] place-items-center px-4 text-center"><div><h1 className="font-display text-2xl font-black">{missing ? "Dub Pack олдсонгүй" : "Dub Pack ачаалж байна..."}</h1><Link href="/admin" className="mt-4 inline-block font-bold text-teal">Админ editor руу буцах</Link></div></main>;
}