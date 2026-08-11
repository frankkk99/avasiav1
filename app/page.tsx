"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MovieCard } from "@/components/MovieCard";
import { PosterArt } from "@/components/PosterArt";
import { genres, movies } from "@/lib/catalog";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("ทั้งหมด");

  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return movies.filter((movie) => {
      const matchesGenre = genre === "ทั้งหมด" || movie.genre === genre;
      const matchesQuery = !normalizedQuery || `${movie.title} ${movie.titleEn}`.toLowerCase().includes(normalizedQuery);
      return matchesGenre && matchesQuery;
    });
  }, [genre, query]);

  const hero = movies[0];

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">A</span>
          <span>AVASIA</span>
        </Link>
        <nav className="desktop-nav" aria-label="เมนูหลัก">
          <a className="nav-link nav-link--active" href="#discover">ค้นพบ</a>
          <a className="nav-link" href="#new">มาใหม่</a>
          <a className="nav-link" href="#collections">คอลเลกชัน</a>
        </nav>
        <div className="topbar-actions">
          <button className="icon-button" type="button" aria-label="รายการโปรด">♡</button>
          <button className="profile-button" type="button" aria-label="โปรไฟล์">F</button>
        </div>
      </header>

      <section className="hero-section" id="discover">
        <div className="hero-glow hero-glow--one" />
        <div className="hero-glow hero-glow--two" />
        <div className="hero-copy">
          <div className="eyebrow-row"><span className="eyebrow-dot" /> AVASIA ORIGINALS <span className="eyebrow-line" /></div>
          <h1>เรื่องราวที่ดี<br /><em>ลอยอยู่รอบตัวคุณ</em></h1>
          <p>พื้นที่ดูหนังและซีรีส์ในบรรยากาศ Floating Glass ที่ให้ทุกค่ำคืนมีประกายของตัวเอง</p>
          <div className="hero-actions">
            <Link className="gold-button" href={`/watch/${hero.slug}`}><span>▶</span> เริ่มรับชม</Link>
            <a className="ghost-button" href="#new">สำรวจทั้งหมด <span>↓</span></a>
          </div>
          <div className="hero-stats">
            <div><strong>2.4K</strong><span>เรื่องที่คัดสรร</span></div>
            <div><strong>98%</strong><span>คะแนนความชอบ</span></div>
            <div><strong>4K</strong><span>ภาพคมชัด</span></div>
          </div>
        </div>
        <div className="hero-art-wrap">
          <div className="floating-orbit floating-orbit--one" />
          <div className="floating-orbit floating-orbit--two" />
          <div className="hero-art-card">
            <PosterArt title={hero.title} titleEn={hero.titleEn} accent={hero.accent} />
            <div className="hero-art-label"><span>01</span><span>FEATURED TONIGHT</span><span>↗</span></div>
          </div>
          <div className="floating-note floating-note--top"><span>✦</span><small>NOW PLAYING</small><b>Tonight&apos;s pick</b></div>
          <div className="floating-note floating-note--bottom"><span>✧</span><small>CURATED FOR YOU</small><b>8.7 <i>★</i></b></div>
        </div>
      </section>

      <section className="toolbar-section" id="new">
        <div className="section-heading">
          <div><span className="eyebrow">BROWSE THE ATMOSPHERE</span><h2>เลือกอารมณ์ของคืนนี้</h2></div>
          <span className="result-count">{filteredMovies.length} เรื่อง</span>
        </div>
        <div className="toolbar">
          <div className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อหนังหรือซีรีส์" /></div>
          <div className="genre-list" role="list" aria-label="ประเภทหนัง">
            {genres.map((item) => <button className={genre === item ? "genre-chip genre-chip--active" : "genre-chip"} key={item} onClick={() => setGenre(item)} type="button">{item}</button>)}
          </div>
        </div>
      </section>

      <section className="catalog-section" id="collections">
        <div className="catalog-header"><div><span className="eyebrow">CURATED COLLECTION</span><h2>ลอยเด่นในคืนนี้</h2></div><a href="#discover">ดูทั้งหมด ↗</a></div>
        {filteredMovies.length ? <div className="movie-grid">{filteredMovies.map((movie) => <MovieCard key={movie.slug} movie={movie} />)}</div> : <div className="empty-state"><span>⌕</span><h3>ยังไม่พบเรื่องที่ค้นหา</h3><p>ลองเปลี่ยนคำค้นหรือเลือกประเภทอื่นดูนะ</p></div>}
      </section>

      <section className="quote-strip"><div className="quote-mark">“</div><p>หนังที่ดีไม่ได้พาเราออกจากโลก<br /><em>แต่มันทำให้เราเห็นโลกชัดขึ้น</em></p><span className="quote-author">AVASIA / 2026</span></section>

      <footer className="footer"><Link className="brand" href="/"><span className="brand-mark">A</span><span>AVASIA</span></Link><span>Floating Glass Cinema</span><span>© 2026 AVASIA</span></footer>

      <div className="mobile-dock"><a className="mobile-dock__active" href="#discover"><span>⌂</span><small>หน้าแรก</small></a><a href="#new"><span>⌕</span><small>ค้นหา</small></a><a href="#collections"><span>✦</span><small>คอลเลกชัน</small></a><a href="#discover"><span>♡</span><small>ของฉัน</small></a></div>
    </main>
  );
}
