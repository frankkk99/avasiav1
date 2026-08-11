import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AVASIA — ดูหนังและซีรีส์",
  description: "Floating Glass Cinema สำหรับหนังและซีรีส์ที่คัดมาให้คุณ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
