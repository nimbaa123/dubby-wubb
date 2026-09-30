import Link from "next/link";
export default function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-black">{title}</h1>
      <p className="mt-4 font-medium text-ink/70">{note}</p>
      <Link href="/dub-packs" className="chunk press mt-8 inline-block rounded-xl bg-sun px-6 py-3 font-black">Dub Packs үзэх</Link>
    </main>
  );
}
