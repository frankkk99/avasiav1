import { diagnoseHlsManifest } from "@/lib/hls-diagnostic";
import { createPlaybackSession, playbackTtlSeconds } from "@/lib/playback-session";
import { defaultUserAgent } from "@/lib/security";
import { resolveUpload18Player } from "@/lib/upload18-resolver";

export type Upload18PlaybackInput = {
  playerPageUrl?: string;
  playerPageUrls?: string[];
  origin?: string;
  referer?: string;
  userAgent?: string;
  testSegment?: boolean;
};

function publicDiagnostics(diagnostics: Awaited<ReturnType<typeof diagnoseHlsManifest>>) {
  return {
    ...diagnostics,
    manifest: {
      ...diagnostics.manifest,
      requestedUrl: "[temporary Upload18 manifest]",
      finalUrl: "[temporary Upload18 manifest]",
    },
    segmentTest: diagnostics.segmentTest
      ? { ...diagnostics.segmentTest, url: "[temporary Upload18 segment]" }
      : null,
  };
}

export async function startUpload18Playback(input: Upload18PlaybackInput) {
  const origin = input.origin || "https://upload18.org";
  const referer = input.referer || "https://upload18.org/";
  const userAgent = input.userAgent || defaultUserAgent();
  const candidates = [...new Set([...(input.playerPageUrls || []), input.playerPageUrl].filter((value): value is string => Boolean(value)))];
  if (!candidates.length) throw new Error("ไม่พบ Upload18 Player URL");

  const attempts: Array<{ playerPageUrl: string; ok: boolean; error?: string }> = [];
  let resolved: Awaited<ReturnType<typeof resolveUpload18Player>> | null = null;
  let diagnostics: Awaited<ReturnType<typeof diagnoseHlsManifest>> | null = null;

  for (const candidate of candidates) {
    try {
      const nextResolved = await resolveUpload18Player(candidate);
      const nextDiagnostics = await diagnoseHlsManifest({
        url: nextResolved.m3u8,
        origin,
        referer,
        userAgent,
        testSegment: input.testSegment,
      });
      attempts.push({ playerPageUrl: candidate, ok: nextDiagnostics.ok });
      if (nextDiagnostics.ok) {
        resolved = nextResolved;
        diagnostics = nextDiagnostics;
        break;
      }
    } catch (error) {
      attempts.push({
        playerPageUrl: candidate,
        ok: false,
        error: error instanceof Error ? error.message : "Resolver failed",
      });
    }
  }

  if (!resolved || !diagnostics) {
    return {
      ok: false as const,
      error: "ไม่มี Player URL ใด resolve และผ่านการตรวจ Manifest/Segment",
      attempts,
    };
  }

  const session = createPlaybackSession({
    provider: "upload18",
    playerPageUrl: resolved.playerPageUrl,
    fallbackPlayerPageUrls: candidates.filter((candidate) => candidate !== resolved?.playerPageUrl),
    m3u8: resolved.m3u8,
    origin,
    referer,
    userAgent,
  });

  return {
    ok: true as const,
    source: {
      title: resolved.title,
      playerPageUrl: resolved.playerPageUrl,
      provider: "upload18" as const,
      origin,
      referer,
      status: "ready" as const,
    },
    diagnostics: publicDiagnostics(diagnostics),
    attempts,
    session: {
      token: session.token,
      playbackUrl: `/api/playback/${session.token}`,
      expiresAt: session.payload.expiresAt,
      ttlSeconds: playbackTtlSeconds(),
    },
  };
}
