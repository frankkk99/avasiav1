"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { Movie } from "@/lib/catalog";
import { MovieCard } from "@/components/MovieCard";
import { PosterArt } from "@/components/PosterArt";
import { PlaybackVideo } from "@/components/PlaybackVideo";
import { movies } from "@/lib/catalog";

export function WatchClient({ movie }: { movie: Movie }) {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [playbackMessage, setPlaybackMessage] = useState("");
  const [playbackError, setPlaybackError] = useState("");
  const recommendations = movies.filter((item) => item.slug !== movie.slug).slice(0, 4);
  const player = movie.player;

  const startPlayback = useCallback(async () => {
    if (!player || loading || playbackUrl) return;
    setStarted(true);
    setLoading(true);
    setPlaybackError("");
    setPlaybackMessage("กำลังเปิด Upload18 และอ่าน PLAYER_CONFIG.m3u8…");

    try {
      const response = await fetch("/api/playback/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerPageUrl: player.player_page_url,
          playerPageUrls: [player.player_page_url, ...(movie.fallback_players || []).map((fallback) => fallback.player_page_url)],
          origin: player.origin,
          referer: player.referer,
          testSegment: true,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        session?: { playbackUrl: string };
      };
      if (!response.ok || !data.ok || !data.session?.playbackUrl) {
        throw new Error(data.error || "ไม่สามารถสร้าง Playback Session ได้");
      }
      setPlaybackUrl(data.session.playbackUrl);
      setPlaybackMessage("ตรวจ HLS และ Segment ผ่านแล้ว — กำลังเริ่มเล่น");
    } catch (error) {
      setPlaybackError(error instanceof Error ? error.message : "Playback Resolver ล้มเหลว");
      setPlaybackMessage("");
    } finally {
      setLoading(false);
    }
  }, [loading, playbackUrl, player]);

  const handlePlaybackStatus = useCallback((message: string) => {
    setPlaybackMessage(message);
  }, []);

  return (
    <main className="watch-shell">
      <header className="topbar topbar--watch">
        <Link className="brand" href="/"><span className="brand-mark">A</span><span>AVASIA</span></Link>
        <Link className="back-link" href="/">← กลับหน้าหลัก</Link>
        <button className="profile-button" type="button">F</button>
      </header>

      <section className="watch-layout">
        <div className={`player-stage${started ? " player-stage--started" : ""}`}>
          {playbackUrl ? (
            <PlaybackVideo source={playbackUrl} onStatus={handlePlaybackStatus} />
          ) : (
            <>
              <div className="player-stage__ambient" style={{ background: `radial-gradient(circle at 50% 40%, ${movie.accent.split(",")[0]}33, transparent 55%)` }} />
              <PosterArt title={movie.title} titleEn={movie.titleEn} accent={movie.accent} />
              <div className="player-stage__veil" />
              <div className="player-stage__controls">
                <button className="big-play" type="button" onClick={startPlayback} aria-label="เริ่มรับชม">{loading ? "…" : "▶"}</button>
                <span>{loading ? playbackMessage : player ? "กดเพื่อเริ่มรับชม" : "ยังไม่มี Player URL"}</span>
              </div>
            </>
          )}
          <div className="player-stage__status"><span className="status-pulse" /> {playbackUrl ? "HLS SESSION · AUTO REFRESH" : "PLAYER URL · RESOLVER"}</div>
        </div>

        {playbackError && <div style={{ gridColumn: "1 / -1", border: "1px solid rgba(255,123,140,.25)", borderRadius: 10, padding: "10px 12px", color: "#ffb3bd", background: "rgba(255,123,140,.08)", fontSize: 12 }}>{playbackError}</div>}

        <aside className="watch-info glass-panel">
          <span className="eyebrow">AVASIA FEATURED</span>
          <h1>{movie.title}</h1><p className="watch-info__english">{movie.titleEn}</p>
          <div className="watch-info__meta"><span>★ {movie.rating}</span><i /><span>{movie.year}</span><i /><span>{movie.genre}</span><i /><span>{movie.duration}</span></div>
          <p className="watch-info__description">{movie.description}</p>
          <div className="watch-info__tags"><span>เสียงไทย</span><span>ซับไทย</span><span>4K</span></div>
          <div className="resolver-note"><span>✦</span><div><b>Smart Playback</b><small>ระบบจะเรียก Player Resolver ตอนเริ่มเล่น เพื่อใช้ลิงก์ที่สดใหม่</small></div></div>
          <div className="watch-actions"><button className="gold-button" type="button" onClick={startPlayback} disabled={!player || loading || Boolean(playbackUrl)}><span>▶</span> {playbackUrl ? "กำลังรับชม" : loading ? "กำลังเตรียม Player…" : "รับชมตอนนี้"}</button><button className="round-action" type="button" aria-label="เพิ่มรายการโปรด">♡</button><button className="round-action" type="button" aria-label="แชร์">↗</button></div>
        </aside>
      </section>

      <section className="watch-below"><div className="catalog-header"><div><span className="eyebrow">KEEP EXPLORING</span><h2>เรื่องที่น่าจะชอบ</h2></div><Link href="/#collections">ดูทั้งหมด ↗</Link></div><div className="recommendation-grid">{recommendations.map((item) => <MovieCard key={item.slug} movie={item} />)}</div></section>
    </main>
  );
}
