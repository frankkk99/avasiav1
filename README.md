# AVASIA

Floating Glass Cinema in a warm gold visual system.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The catalog currently uses local sample data in `lib/catalog.ts`. Player URLs are kept as source-page references so a future resolver can request a fresh playback URL when the viewer starts watching.

## Admin HLS Lab

The HLS diagnostic tools from `frankkk99/hlstest` are available under `/admin`:

- `/admin/hls-test` — manifest, Origin/Referer, expiry and first-segment diagnostics
- `/admin/avdb-import-test` — AVDB page/API import test
- `/admin/embed-test` — iframe/player wrapper test

Set `ALLOWED_HLS_HOSTS` to the smallest approved host list. Keep `ENABLE_STREAM_PROXY=false` on public deployments; enable it only for local or private playback testing.

## Upload18 Resolver

Movie records keep the Upload18 page URL, not a permanent `.m3u8` URL:

```json
{
  "title": "BOBB-373",
  "player_page_url": "https://upload18.org//play//index//bobb-373",
  "provider": "upload18",
  "origin": "https://upload18.org",
  "referer": "https://upload18.org/",
  "status": "unchecked"
}
```

When playback starts, `/api/playback/start` opens the page in Chromium, reads `window.PLAYER_CONFIG.m3u8`, runs the HLS/segment diagnostic, and returns a short-lived signed Playback Session. HLS.js plays through `/api/playback/[session]`; when the session expires, the proxy resolves the Player URL again and rewrites the next manifest with a fresh session. Fallback Player URLs are attempted in order.
