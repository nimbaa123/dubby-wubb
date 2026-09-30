import Link from "next/link";

export default function Hero() {
  return (
    <section className="border-b-[3px] border-ink bg-cream">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="chunk-sm inline-block -rotate-1 rounded-lg bg-teal px-3 py-1 font-bold">Монголын онлайн дуу оруулалтын тоглоом</p>
          <h1 className="mt-5 font-display text-4xl font-black leading-[1.05] sm:text-5xl xl:text-6xl">Дуртай дүрдээ өөрийн дуу хоолойг оруул</h1>
          <p className="mt-5 max-w-xl text-lg font-medium text-ink/80">Кино, анимэ, хүүхэлдэйн кино болон хөгжилтэй бичлэгүүдээс сонгоод дүрийн яриаг өөрийн хоолойгоор дуу оруулаарай.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/play/tsagaan-tsuvraa" className="chunk press rounded-xl bg-coral px-6 py-4 font-display font-black text-white">ТОГЛОЖ ЭХЛЭХ</Link>
            <Link href="/dub-packs" className="chunk press rounded-xl bg-sun px-6 py-4 font-display font-black">DUB PACK ҮЗЭХ</Link>
          </div>
        </div>
        {/* Static preview of the studio */}
        <div className="chunk rotate-1 rounded-2xl bg-ink p-4 text-cream" aria-hidden>
          <div className="grid aspect-video place-items-center rounded-xl bg-sun text-7xl text-ink">🐰
            <span className="-mt-16 rounded bg-ink px-2 py-0.5 text-xs font-bold text-sun">Туулай</span>
          </div>
          <p className="mt-3 text-xs font-bold text-teal">ТАНЫ ЯРИА · Мөр 2 / 4</p>
          <p className="font-display text-lg font-black">“Өө, өнөөдөр ямар сайхан өглөө вэ!”</p>
          <div className="mt-3 flex h-10 items-end gap-1">
            {Array.from({ length: 32 }, (_, i) => <span key={i} className="flex-1 rounded-sm bg-coral" style={{ height: `${20 + ((i * 37) % 70)}%` }} />)}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-black sm:text-xs">
            <span className="rounded-lg bg-teal p-2 text-ink">▶ ЭХ ХУВИЛБАР</span>
            <span className="rounded-lg bg-coral p-2">● БИЧЛЭГ</span>
            <span className="rounded-lg bg-cream/20 p-2">▶ МИНИЙ</span>
          </div>
        </div>
      </div>
    </section>
  );
}
