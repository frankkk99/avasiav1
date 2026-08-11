"use client";

import Hls from "hls.js";
import { useEffect, useRef } from "react";

type Props = {
  source: string;
  onStatus?: (message: string) => void;
};

export function PlaybackVideo({ source, onStatus }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    hlsRef.current?.destroy();
    hlsRef.current = null;
    onStatus?.("กำลังโหลด Playback Session…");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      onStatus?.("กำลังเล่นผ่าน native HLS");
      void video.play().catch(() => onStatus?.("พร้อมเล่น — กดปุ่ม Play"));
      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }

    if (!Hls.isSupported()) {
      onStatus?.("Browser นี้ไม่รองรับ HLS.js");
      return;
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      maxBufferLength: 30,
      backBufferLength: 30,
    });
    hlsRef.current = hls;
    hls.attachMedia(video);
    hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(source));
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      onStatus?.("HLS ผ่านแล้ว — กำลังเล่น");
      void video.play().catch(() => onStatus?.("พร้อมเล่น — กดปุ่ม Play"));
    });
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return;
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        onStatus?.("กำลังต่ออายุ Playback Session…");
        hls.startLoad();
      } else {
        onStatus?.(`Player error: ${data.details}`);
      }
    });

    return () => {
      hls.destroy();
      if (hlsRef.current === hls) hlsRef.current = null;
    };
  }, [source, onStatus]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      className="watch-video"
      style={{ display: "block", width: "100%", height: "100%", minHeight: "100%", background: "#000", objectFit: "contain" }}
    />
  );
}
