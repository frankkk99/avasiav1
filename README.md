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
