import { NextResponse } from "next/server";
import { handleAskRequest } from "@/lib/server/askHandler";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON形式で送信してください。" },
      { status: 400 },
    );
  }

  const result = await handleAskRequest(body);

  return NextResponse.json(result.body, { status: result.status });
}