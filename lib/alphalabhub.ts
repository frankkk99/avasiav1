import { randomUUID } from "node:crypto";

const DEFAULT_ALPHALABHUB_URL = "https://qlunnckudeynhruxzpnb.supabase.co";

export type PersistenceResult = {
  persisted: boolean;
  runId?: string;
  itemsSaved?: number;
  reason?: string;
  error?: string;
};

type ToolRunInput = {
  tool: string;
  mode?: string;
  sourceUrl?: string | null;
  finalUrl?: string | null;
  status: "success" | "failed" | "partial";
  itemCount?: number;
  result?: unknown;
  error?: string | null;
  runId?: string;
};

type AvdbItem = {
  row?: number;
  apiUrl?: string;
  apiStatus?: number;
  apiElapsedMs?: number;
  id?: number | string | null;
  name?: string;
  slug?: string;
  movieCode?: string;
  typeName?: string;
  year?: string;
  quality?: string;
  duration?: string;
  posterUrl?: string;
  thumbUrl?: string;
  playerUrl?: string | null;
  [key: string]: unknown;
};

function config() {
  const url = (
    process.env.ALPHALABHUB_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    DEFAULT_ALPHALABHUB_URL
  ).replace(/\/$/, "");
  const serviceKey =
    process.env.ALPHALABHUB_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";
  const anonKey =
    process.env.ALPHALABHUB_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";
  const functionUrl =
    process.env.ALPHALABHUB_SUPABASE_FUNCTION_URL ||
    `${url}/functions/v1/avasi-admin-store`;

  return { url, serviceKey, anonKey, functionUrl };
}

function redactUrl(value: string | null | undefined) {
  if (!value) return value ?? null;
  try {
    const url = new URL(value);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "[redacted-url]";
  }
}

function sanitizeForStorage(value: unknown, key = ""): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    if (key === "preview") return "[omitted from storage]";
    if (key === "m3u8" || key === "url" || key === "finalUrl" || key === "requestedUrl") return redactUrl(value);
    return value.length > 20_000 ? `${value.slice(0, 20_000)}…` : value;
  }
  if (Array.isArray(value)) return value.map((item) => sanitizeForStorage(item, key));
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => [
        entryKey,
        sanitizeForStorage(entryValue, entryKey),
      ]),
    );
  }
  return value;
}

async function restRequest(path: string, init: RequestInit = {}) {
  const { url, serviceKey } = config();
  if (!serviceKey) return { configured: false as const };

  const headers = new Headers(init.headers);
  headers.set("apikey", serviceKey);
  headers.set("Authorization", `Bearer ${serviceKey}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const detail = typeof body === "string" ? body : JSON.stringify(body);
    throw new Error(`Alphalab Hub REST ${response.status}: ${detail.slice(0, 500)}`);
  }

  return { configured: true as const, body };
}

async function functionRequest(action: string, payload: Record<string, unknown> = {}) {
  const { anonKey, functionUrl } = config();
  if (!anonKey) return { configured: false as const };

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, ...payload }),
    cache: "no-store",
  });
  const text = await response.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok || body?.ok === false) {
    const detail = typeof body === "string" ? body : JSON.stringify(body);
    throw new Error(`Alphalab Hub Function ${response.status}: ${detail.slice(0, 500)}`);
  }

  return { configured: true as const, body };
}

async function storeRequest(action: string, payload: Record<string, unknown> = {}) {
  const { serviceKey } = config();
  if (serviceKey && action === "run") {
    return restRequest("avasi_tool_runs", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify([payload.run]),
    });
  }
  if (serviceKey && action === "catalog_upsert") {
    return restRequest("avasi_catalog_items?on_conflict=source_key", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(payload.rows),
    });
  }
  return functionRequest(action, payload);
}

export async function persistToolRun(input: ToolRunInput): Promise<PersistenceResult> {
  const { serviceKey, anonKey } = config();
  if (!serviceKey && !anonKey) {
    return {
      persisted: false,
      reason: "missing_supabase_server_key",
      error: "ยังไม่ได้ตั้ง ALPHALABHUB_SUPABASE_ANON_KEY หรือ ALPHALABHUB_SUPABASE_SERVICE_ROLE_KEY ฝั่งเซิร์ฟเวอร์",
    };
  }

  const runId = input.runId || randomUUID();
  try {
    await storeRequest("run", {
      run: {
        id: runId,
        tool: input.tool,
        mode: input.mode || null,
        source_url: redactUrl(input.sourceUrl),
        final_url: redactUrl(input.finalUrl),
        status: input.status,
        item_count: input.itemCount || 0,
        result: sanitizeForStorage(input.result) || {},
        error: input.error || null,
      },
    });

    return { persisted: true, runId, itemsSaved: 0 };
  } catch (error) {
    return {
      persisted: false,
      runId,
      error: error instanceof Error ? error.message : "บันทึก Alphalab Hub ไม่สำเร็จ",
    };
  }
}

export async function persistAvdbScan(input: {
  pageUrl: string;
  finalPageUrl?: string | null;
  status: "success" | "failed" | "partial";
  items: AvdbItem[];
  result: unknown;
  error?: string | null;
}): Promise<PersistenceResult> {
  const run = await persistToolRun({
    tool: "avdb_scan",
    mode: "chromium",
    sourceUrl: input.pageUrl,
    finalUrl: input.finalPageUrl,
    status: input.status,
    itemCount: input.items.length,
    result: input.result,
    error: input.error,
  });

  if (!run.persisted || !run.runId || !input.items.length) return run;

  try {
    const rows = input.items.map((item) => {
      const externalKey = item.id ?? item.movieCode ?? item.slug ?? item.apiUrl ?? item.row;
      return {
        source_key: `avdb:${String(externalKey)}`,
        run_id: run.runId,
        source_url: input.pageUrl,
        api_url: item.apiUrl || "",
        api_status: item.apiStatus ?? null,
        api_elapsed_ms: item.apiElapsedMs ?? null,
        external_id: item.id === null || item.id === undefined ? null : String(item.id),
        movie_code: item.movieCode || null,
        name: item.name || "",
        slug: item.slug || null,
        type_name: item.typeName || null,
        year: item.year || null,
        quality: item.quality || null,
        duration: item.duration || null,
        poster_url: item.posterUrl || null,
        thumb_url: item.thumbUrl || null,
        player_url: item.playerUrl || null,
        raw_data: sanitizeForStorage(item),
      };
    });

    await storeRequest("catalog_upsert", { rows });

    return { ...run, itemsSaved: rows.length };
  } catch (error) {
    return {
      ...run,
      persisted: false,
      itemsSaved: 0,
      error: error instanceof Error ? error.message : "บันทึกรายการ AVDB ไม่สำเร็จ",
    };
  }
}

export async function listToolRuns(limit = 50) {
  const { serviceKey, anonKey } = config();
  if (!serviceKey && !anonKey) {
    return {
      configured: false,
      runs: [],
      error: "ยังไม่ได้ตั้ง ALPHALABHUB_SUPABASE_ANON_KEY หรือ ALPHALABHUB_SUPABASE_SERVICE_ROLE_KEY ฝั่งเซิร์ฟเวอร์",
    };
  }

  try {
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const response = serviceKey
      ? await restRequest(
          `avasi_tool_runs?select=id,tool,mode,source_url,final_url,status,item_count,error,created_at&order=created_at.desc&limit=${safeLimit}`,
        )
      : await functionRequest("list", { limit: safeLimit });
    return { configured: true, runs: response.body?.runs || response.body || [] };
  } catch (error) {
    return {
      configured: true,
      runs: [],
      error: error instanceof Error ? error.message : "อ่านประวัติ Alphalab Hub ไม่สำเร็จ",
    };
  }
}
