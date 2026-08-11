import { notFound } from "next/navigation";
import { getMovie, movies } from "@/lib/catalog";
import { WatchClient } from "@/app/watch/[slug]/WatchClient";

export function generateStaticParams() {
  return movies.map((movie) => ({ slug: movie.slug }));
}

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movie = getMovie(slug);
  if (!movie) notFound();
  return <WatchClient movie={movie} />;
}
