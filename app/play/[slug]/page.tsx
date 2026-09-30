import Studio from "@/components/Studio";
import PublishedPackRoute from "@/components/PublishedPackRoute";
import { getPack } from "@/lib/data";

export default async function Play({ params }: { params: Promise<{ slug: string }> }) {
  const pack = getPack((await params).slug);
  if (pack) return <Studio pack={pack} />;
  return <PublishedPackRoute slug={(await params).slug} />;
}
