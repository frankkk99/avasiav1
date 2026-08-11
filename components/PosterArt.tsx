import type { CSSProperties } from "react";

type PosterArtProps = {
  title: string;
  titleEn?: string;
  accent: string;
  compact?: boolean;
};

type PosterStyle = CSSProperties & { "--poster-accent"?: string };

export function PosterArt({ title, titleEn, accent, compact = false }: PosterArtProps) {
  const style: PosterStyle = { "--poster-accent": accent };

  return (
    <div className={`poster-art${compact ? " poster-art--compact" : ""}`} style={style}>
      <div className="poster-art__orb poster-art__orb--one" />
      <div className="poster-art__orb poster-art__orb--two" />
      <div className="poster-art__grid" />
      <div className="poster-art__copy">
        <span>AVASIA ORIGINALS</span>
        <strong>{title}</strong>
        {titleEn && <small>{titleEn}</small>}
      </div>
      <div className="poster-art__shine" />
    </div>
  );
}
