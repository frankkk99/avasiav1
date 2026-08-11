import { NextRequest, NextResponse } from "next/server";
import { startUpload18Playback } from "@/lib/upload18-playback";

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
      return NextResponse.json({ ok: false, error: "กรุณาระบุ Player URL" }, { status: 400 });
    }

    const result = await startUpload18Playback({ ...body, playerPageUrl: body.playerPageUrl });
    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Upload18 Resolver ล้มเหลว" },
      { status: 400 },
    );
  }
}
