"use client";

import Link from "next/link";
import { useState } from "react";
import type { Movie } from "@/lib/catalog";
import { MovieCard } from "@/components/MovieCard";
import { PosterArt } from "@/components/PosterArt";
import { movies } from "@/lib/catalog";

export function WatchClient({ movie }: { movie: Movie }) {
  const [started, setStarted] = useState(false);
  const recommendations = movies.filter((item) => item.slug !== movie.slug).slice(0, 4);

  return (
    <main className="watch-shell">
      <header className="topbar topbar--watch">
        <Link className="brand" href="/"><span className="brand-mark">A</span><span>AVASIA</span></Link>
        <Link className="back-link" href="/">← กลับหน้าหลัก</Link>
        <button className="profile-button" type="button">F</button>
      </header>

      <section className="watch-layout">
        <div className={`player-stage${started ? " player-stage--started" : ""}`}>
          <div className="player-stage__ambient" style={{ background: `radial-gradient(circle at 50% 40%, ${movie.accent.split(",")[0]}33, transparent 55%)` }} />
          <PosterArt title={movie.title} titleEn={movie.titleEn} accent={movie.accent} />
          <div className="player-stage__veil" />
          <div className="player-stage__controls">
            <button className="big-play" type="button" onClick={() => setStarted(true)} aria-label="เริ่มรับชม">{started ? "✓" : "▶"}</button>
            <span>{started ? "กำลังเตรียม Playback Resolver" : "กดเพื่อเริ่มรับชม"}</span>
          </div>
          <div className="player-stage__status"><span className="status-pulse" /> HLS READY · 4K</div>
        </div>

        <aside className="watch-info glass-panel">
          <span className="eyebrow">AVASIA FEATURED</span>
          <h1>{movie.title}</h1><p className="watch-info__english">{movie.titleEn}</p>
          <div className="watch-info__meta"><span>★ {movie.rating}</span><i /><span>{movie.year}</span><i /><span>{movie.genre}</span><i /><span>{movie.duration}</span></div>
          <p className="watch-info__description">{movie.description}</p>
          <div className="watch-info__tags"><span>เสียงไทย</span><span>ซับไทย</span><span>4K</span></div>
          <div className="resolver-note"><span>✦</span><div><b>Smart Playback</b><small>ระบบจะเรียก Player Resolver ตอนเริ่มเล่น เพื่อใช้ลิงก์ที่สดใหม่</small></div></div>
          <div className="watch-actions"><button className="gold-button" type="button" onClick={() => setStarted(true)}><span>▶</span> รับชมตอนนี้</button><button className="round-action" type="button" aria-label="เพิ่มรายการโปรด">♡</button><button className="round-action" type="button" aria-label="แชร์">↗</button></div>
        </aside>
      </section>

      <section className="watch-below"><div className="catalog-header"><div><span className="eyebrow">KEEP EXPLORING</span><h2>เรื่องที่น่าจะชอบ</h2></div><Link href="/#collections">ดูทั้งหมด ↗</Link></div><div className="recommendation-grid">{recommendations.map((item) => <MovieCard key={item.slug} movie={item} />)}</div></section>
    </main>
  );
}
