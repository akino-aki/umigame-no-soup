import { NextResponse } from "next/server";
import { getJudgeClient } from "@/lib/ai/judge";
import type { GameMessage } from "@/lib/ai/types";
import { getSecretStory } from "@/lib/server/storyBank";

type AskBody = {
  question?: unknown;
  history?: unknown;
};

function isGameMessageArray(value: unknown): value is GameMessage[] {
  return Array.isArray(value) && value.every((item) => {
    if (typeof item !== "object" || item === null) return false;
    const record = item as Record<string, unknown>;
    return (record.role === "user" || record.role === "judge") && typeof record.text === "string";
  });
}

export async function POST(request: Request) {
  let body: AskBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON形式で送信してください。" }, { status: 400 });
  }

  if (typeof body.question !== "string" || body.question.trim().length === 0) {
    return NextResponse.json({ error: "質問を入力してください。" }, { status: 400 });
  }

  if (body.question.length > 200) {
    return NextResponse.json({ error: "質問は200文字以内にしてください。" }, { status: 400 });
  }

  const history = isGameMessageArray(body.history) ? body.history.slice(-20) : [];
  const story = getSecretStory();
  const judge = getJudgeClient();

  const result = await judge({
    story,
    question: body.question,
    history,
  });

  return NextResponse.json({
    ...result,
    truth: result.shouldRevealTruth ? story.truth : undefined,
  });
}
