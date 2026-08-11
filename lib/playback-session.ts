import { createHmac, timingSafeEqual } from "node:crypto";

export type PlaybackSessionPayload = {
  version: 1;
  provider: "upload18";
  playerPageUrl: string;
  fallbackPlayerPageUrls?: string[];
  m3u8: string;
  origin: string;
  referer: string;
  userAgent: string;
  issuedAt: number;
  expiresAt: number;
};

const DEFAULT_TTL_SECONDS = 300;

function secret() {
  return process.env.PLAYBACK_SESSION_SECRET || "avasiav1-local-playback-secret";
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signature(body: string) {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function playbackTtlSeconds() {
  const parsed = Number(process.env.PLAYBACK_SESSION_TTL_SECONDS || DEFAULT_TTL_SECONDS);
  return Number.isFinite(parsed) && parsed >= 30 && parsed <= 1800 ? Math.floor(parsed) : DEFAULT_TTL_SECONDS;
}

export function createPlaybackSession(
  input: Omit<PlaybackSessionPayload, "version" | "issuedAt" | "expiresAt">,
  ttlSeconds = playbackTtlSeconds(),
) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: PlaybackSessionPayload = {
    ...input,
    fallbackPlayerPageUrls: input.fallbackPlayerPageUrls || [],
    version: 1,
    issuedAt,
    expiresAt: issuedAt + ttlSeconds,
  };
  const body = encode(JSON.stringify(payload));
  return {
    token: `${body}.${signature(body)}`,
    payload,
  };
}

export function verifyPlaybackSession(token: string, allowExpired = false): PlaybackSessionPayload {
  const [body, providedSignature] = token.split(".");
  if (!body || !providedSignature) throw new Error("Playback Session ไม่ถูกต้อง");

  const expectedSignature = signature(body);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new Error("Playback Session signature ไม่ถูกต้อง");
  }

  let payload: PlaybackSessionPayload;
  try {
    payload = JSON.parse(decode(body)) as PlaybackSessionPayload;
  } catch {
    throw new Error("Playback Session payload ไม่ถูกต้อง");
  }

  if (payload.version !== 1 || payload.provider !== "upload18" || !payload.playerPageUrl || !payload.m3u8) {
    throw new Error("Playback Session payload ไม่ครบ");
  }
  if (!allowExpired && payload.expiresAt <= Math.floor(Date.now() / 1000)) {
    throw new Error("Playback Session หมดอายุ");
  }

  return payload;
}
