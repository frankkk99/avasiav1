import { NextRequest, NextResponse } from "next/server";
import { startUpload18Playback } from "@/lib/upload18-playback";
import { persistToolRun } from "@/lib/alphalabhub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      playerPageUrl?: string;
      playerPageUrls?: string[];
      origin?: string;
      referer?: string;
      userAgent?: string;
      testSegment?: boolean;
    };

    if (!body.playerPageUrl && !body.playerPageUrls?.length) {
      return NextResponse.json({ ok: false, error: "กรุณาระบุ Upload18 Player URL" }, { status: 400 });
    }

    const result = await startUpload18Playback({ ...body, playerPageUrl: body.playerPageUrl });
    const persistence = await persistToolRun({
      tool: "upload18_resolve",
      mode: "player_page",
      sourceUrl: body.playerPageUrl || body.playerPageUrls?.[0] || null,
      finalUrl: result.ok ? result.source.playerPageUrl : null,
      status: result.ok ? "success" : "failed",
      result,
      error: result.ok ? null : result.error,
    });
    return NextResponse.json({ ...result, persistence }, { status: result.ok ? 200 : 422 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Upload18 Resolver ล้มเหลว" },
      { status: 400 },
    );
  }
}
