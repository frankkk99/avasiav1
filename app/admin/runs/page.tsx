"use client";

import { useEffect, useState } from "react";

type Run = {
  id: string;
  tool: string;
  mode: string | null;
  source_url: string | null;
  status: string;
  item_count: number;
  error: string | null;
  created_at: string;
};

type RunsResponse = {
  configured: boolean;
  runs: Run[];
  error?: string;
};

const toolLabels: Record<string, string> = {
  avdb_scan: "AVDB Import",
  hls_probe: "HLS Probe",
  upload18_resolve: "Upload18 Resolver",
};

export default function AdminRunsPage() {
  const [data, setData] = useState<RunsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/runs", { cache: "no-store" });
      setData((await response.json()) as RunsResponse);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">ALPHALAB HUB</p>
          <h1>ประวัติการดึงข้อมูล</h1>
          <p className="subtitle">ดูรายการ AVDB Import, HLS Probe และ Upload18 Resolver ที่ถูกบันทึกจากหลังบ้าน</p>
        </div>
        <button className="secondary" type="button" onClick={() => void load()} disabled={loading}>
          {loading ? "กำลังอ่าน…" : "รีเฟรช"}
        </button>
      </section>

      {!data?.configured && (
        <div className="alert badbox">
          ยังไม่เชื่อม Alphalab Hub: ตั้ง <code>ALPHALABHUB_SUPABASE_ANON_KEY</code> และ Function URL ฝั่งเซิร์ฟเวอร์ก่อนใช้งานจริง
        </div>
      )}
      {data?.error && <div className="alert badbox">{data.error}</div>}

      <section className="panel diagnostics">
        <div className="panel-title"><div><p className="eyebrow">RUNS</p><h2>รายการล่าสุด</h2></div><span className="hint">{data?.runs.length ?? 0} รายการ</span></div>
        {data?.runs.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {data.runs.map((run) => (
              <article key={run.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, padding: 13, background: "rgba(3,11,19,.42)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <b>{toolLabels[run.tool] || run.tool}</b>
                    <span className={`badge ${run.status === "success" ? "good" : run.status === "partial" ? "neutral" : "bad"}`}>{run.status}</span>
                    <span className="binding">{run.item_count} รายการ</span>
                  </div>
                  <div className="hint" style={{ marginTop: 7, overflowWrap: "anywhere" }}>{run.source_url || "ไม่มี Source URL"}</div>
                  <div className="hint" style={{ marginTop: 4 }}>{new Date(run.created_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</div>
                </div>
                {run.error && <span style={{ color: "#ffb3bd", fontSize: 12, maxWidth: 280 }}>{run.error}</span>}
              </article>
            ))}
          </div>
        ) : (
          <p className="hint">ยังไม่มีประวัติการรัน</p>
        )}
      </section>
    </main>
  );
}
