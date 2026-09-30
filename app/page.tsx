import Hero from "@/components/Hero";
import DubPackCarousel from "@/components/DubPackCarousel";

const STEPS = [
  ["Бичлэгээ сонго", "Дуртай кино, анимэ эсвэл хөгжилтэй хэсгээ сонго.", "bg-sun"],
  ["Дуугаа бич", "Дүрийн яриаг сонсоод микрофоноор өөрийн хувилбараа бич.", "bg-coral text-white"],
  ["Үр дүнгээ үз", "Бүх мөрөө дуусгаад өөрийн дубтай бичлэгээ үзэж, хуваалц.", "bg-teal"],
];

export default function Home() {
  return (
    <main>
      <Hero />
      <DubPackCarousel />
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <h2 className="font-display text-2xl font-black sm:text-3xl">Dubby-Wubb хэрхэн ажилладаг вэ?</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {STEPS.map(([t, d, c], i) => (
            <div key={t} className={`chunk rounded-2xl p-6 ${c}`}>
              <span className="font-display text-5xl font-black opacity-40">0{i + 1}</span>
              <h3 className="mt-2 font-display text-xl font-black">{t}</h3>
              <p className="mt-2 font-medium">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
