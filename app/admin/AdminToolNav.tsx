"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tools = [
  { href: "/admin/avdb-import-test", label: "AVDB Import", note: "ดึงข้อมูล 1 หน้า" },
  { href: "/admin/hls-test", label: "HLS Test", note: "ตรวจ Manifest / Segment" },
  { href: "/admin/embed-test", label: "Embed Test", note: "ทดลองครอบ Player" },
];

export default function AdminToolNav() {
  const pathname = usePathname();

  if (pathname === "/admin/embed" || pathname.startsWith("/admin/embed/")) return null;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,.08)",
        background: "rgba(5,12,19,.88)",
        backdropFilter: "blur(18px)",
      }}
    >
      <nav
        aria-label="เครื่องมือหลังบ้าน"
        style={{
          width: "min(1180px, calc(100% - 24px))",
          margin: "0 auto",
          minHeight: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          padding: "8px 0",
        }}
      >
        <Link
          href="/admin/hls-test"
          style={{
            color: "#eef5fb",
            textDecoration: "none",
            fontWeight: 900,
            letterSpacing: "-.02em",
            whiteSpace: "nowrap",
          }}
        >
          HLS LAB <span style={{ color: "#d9ad54", fontSize: 10 }}>ADMIN</span>
        </Link>

        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 1 }}>
          {tools.map((tool) => {
            const active = pathname.startsWith(tool.href);
            return (
              <Link
                key={tool.href}
                href={tool.href}
                title={tool.note}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  minHeight: 38,
                  padding: "8px 11px",
                  borderRadius: 11,
                  border: active
                    ? "1px solid rgba(104,168,255,.62)"
                    : "1px solid rgba(255,255,255,.09)",
                  background: active ? "rgba(45,126,247,.18)" : "rgba(255,255,255,.035)",
                  color: active ? "#bcd8ff" : "#aebdca",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                {tool.label}
                {active && <span style={{ width: 6, height: 6, borderRadius: 99, background: "#68a8ff" }} />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
