import { NextRequest, NextResponse } from "next/server";
import { createPlaybackSession, verifyPlaybackSession, type PlaybackSessionPayload } from "@/lib/playback-session";
import { buildUpstreamHeaders, validateUpstreamUrl } from "@/lib/security";
import { resolveUpload18Player } from "@/lib/upload18-resolver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function proxiedUrl(sessionToken: string, target: string) {
  const params = new URLSearchParams({ target });
  return `/api/playback/${sessionToken}?${params.toString()}`;
}

function rewriteManifest(text: string, base: URL, sessionToken: string) {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      if (!trimmed.startsWith("#")) {
        try {
          return proxiedUrl(sessionToken, new URL(trimmed, base).toString());
        } catch {
          return line;
        }
      }

      if (trimmed.includes('URI="')) {
        return line.replace(/URI="([^"]+)"/g, (_match, value: string) => {
          try {
            const absolute = new URL(value, base).toString();
            return `URI="${proxiedUrl(sessionToken, absolute)}"`;
          } catch {
            return `URI="${value}"`;
          }
        });
      }

      return line;
    })
    .join("\n");
}

function responseHeaders(sessionToken: string, expiresAt: number, contentType: string) {
  const headers = new Headers({
    "Content-Type": contentType,
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "X-Playback-Session, X-Playback-Expires-At",
    "X-Playback-Session": sessionToken,
    "X-Playback-Expires-At": String(expiresAt),
  });
  return headers;
}

async function renewSession(payload: PlaybackSessionPayload) {
  const candidates = [payload.playerPageUrl, ...(payload.fallbackPlayerPageUrls || [])];
  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      const resolved = await resolveUpload18Player(candidate);
      return createPlaybackSession({
        provider: "upload18",
        playerPageUrl: candidate,
        fallbackPlayerPageUrls: candidates.filter((value) => value !== candidate),
        m3u8: resolved.m3u8,
        origin: payload.origin,
        referer: payload.referer,
        userAgent: payload.userAgent,
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("ไม่มี fallback Player URL ใช้งานได้");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ session: string }> },
) {
  const { session: requestedToken } = await params;
  let payload: PlaybackSessionPayload;
  let activeToken = requestedToken;
  let renewed = false;

  try {
    payload = verifyPlaybackSession(requestedToken);
  } catch {
    try {
      const expiredPayload = verifyPlaybackSession(requestedToken, true);
      const renewedSession = await renewSession(expiredPayload);
      payload = renewedSession.payload;
      activeToken = renewedSession.token;
      renewed = true;
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: error instanceof Error ? error.message : "Playback Session หมดอายุ" },
        { status: 401 },
      );
    }
  }

  try {
    const requestedTarget = request.nextUrl.searchParams.get("target");
    const targetIsInitialManifest = !requestedTarget || requestedTarget === verifyPlaybackSession(requestedToken, true).m3u8;
    const target = validateUpstreamUrl(targetIsInitialManifest ? payload.m3u8 : requestedTarget);
    const upstream = await fetch(target, {
      method: "GET",
      headers: buildUpstreamHeaders({
        origin: payload.origin,
        referer: payload.referer,
        userAgent: payload.userAgent,
        range: request.headers.get("range"),
      }),
      redirect: "follow",
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const body = /mpegurl/i.test(contentType) || /\.m3u8(?:$|\?)/i.test(target.toString()) || target.pathname.startsWith("/m/");
    if (body) {
      const text = await upstream.text();
      if (text.trimStart().startsWith("#EXTM3U")) {
        const rewritten = rewriteManifest(text, target, activeToken);
        const headers = responseHeaders(activeToken, payload.expiresAt, "application/vnd.apple.mpegurl; charset=utf-8");
        if (renewed) headers.set("X-Playback-Session-Renewed", "1");
        return new NextResponse(rewritten, { status: upstream.status, headers });
      }

      return new NextResponse(text, {
        status: upstream.status,
        headers: responseHeaders(activeToken, payload.expiresAt, contentType),
      });
    }

    const headers = responseHeaders(activeToken, payload.expiresAt, contentType);
    for (const name of ["content-length", "content-range", "accept-ranges"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (renewed) headers.set("X-Playback-Session-Renewed", "1");

    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Playback proxy ล้มเหลว" },
      { status: 400 },
    );
  }
}
