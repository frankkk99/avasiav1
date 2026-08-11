import Link from "next/link";
import type { Movie } from "@/lib/catalog";
import { PosterArt } from "@/components/PosterArt";

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link className="movie-card" href={`/watch/${movie.slug}`}>
      <div className="movie-card__poster">
        <PosterArt title={movie.title} titleEn={movie.titleEn} accent={movie.accent} compact />
        <div className="movie-card__topline">
          {movie.badge ? <span className="card-badge">{movie.badge}</span> : <span />}
          <span className="rating">★ {movie.rating}</span>
        </div>
        <div className="movie-card__play">▶</div>
      </div>
      <div className="movie-card__info">
        <div>
          <h3>{movie.title}</h3>
          <p>{movie.titleEn}</p>
        </div>
        <span className="card-arrow">↗</span>
      </div>
      <div className="movie-card__meta">
        <span>{movie.year}</span>
        <i />
        <span>{movie.genre}</span>
        <i />
        <span>{movie.duration}</span>
      </div>
    </Link>
  );
}
