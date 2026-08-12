import { NextResponse } from "next/server";
import { listToolRuns } from "@/lib/alphalabhub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await listToolRuns();
  return NextResponse.json(result, { status: result.error && result.configured ? 502 : 200 });
}
