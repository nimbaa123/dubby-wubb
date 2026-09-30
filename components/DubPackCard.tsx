import Link from "next/link";
import type { Pack } from "@/lib/data";

export default function DubPackCard({ pack }: { pack: Pack }) {
  return (
    <Link href={`/play/${pack.slug}`} className="chunk press group block w-64 shrink-0 overflow-hidden rounded-2xl bg-white sm:w-72">
      <div className="relative grid h-36 place-items-center border-b-[3px] border-ink text-6xl" style={{ background: pack.color }}>
        <span aria-hidden>{pack.emoji}</span>
        {pack.isNew && <span className="absolute left-2 top-2 rounded bg-coral px-2 py-0.5 text-xs font-black text-white chunk-sm">NEW</span>}
        <span className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-full bg-ink text-sun transition group-hover:scale-110">▶</span>
      </div>
      <div className="p-3">
        <h3 className="font-display text-base font-black leading-tight">{pack.title}</h3>
        <p className="mt-1 text-sm font-medium text-ink/70">{pack.category} · {pack.language}</p>
        <p className="mt-2 text-sm font-bold">{pack.lines.length} мөр · {pack.duration} сек</p>
      </div>
    </Link>
  );
}
