import { getJudgeClient } from "@/lib/ai/judge";
import type { GameMessage, JudgeResponse } from "@/lib/ai/types";
import { getSecretStory } from "@/lib/server/storyBank";

type AskBody = {
  question?: unknown;
  history?: unknown;
};

type AskSuccessBody = JudgeResponse & {
  truth?: string;
};

type AskErrorBody = {
  error: string;
};

type AskHandlerResult = {
  status: number;
  body: AskSuccessBody | AskErrorBody;
};

function isAskBody(value: unknown): value is AskBody {
  return typeof value === "object" && value !== null;
}

function isGameMessageArray(value: unknown): value is GameMessage[] {
  return (
    Array.isArray(value) &&
    value.every((item) => {
      if (typeof item !== "object" || item === null) return false;

      const record = item as Record<string, unknown>;

      return (
        (record.role === "user" || record.role === "judge") &&
        typeof record.text === "string"
      );
    })
  );
}

export async function handleAskRequest(body: unknown): Promise<AskHandlerResult> {
  if (!isAskBody(body)) {
    return {
      status: 400,
      body: { error: "JSON形式で送信してください。" },
    };
  }

  if (typeof body.question !== "string" || body.question.trim().length === 0) {
    return {
      status: 400,
      body: { error: "質問を入力してください。" },
    };
  }

  if (body.question.length > 200) {
    return {
      status: 400,
      body: { error: "質問は200文字以内にしてください。" },
    };
  }

  const history = isGameMessageArray(body.history) ? body.history.slice(-20) : [];

  const story = getSecretStory();
  const judge = getJudgeClient();

  const result = await judge({
    story,
    question: body.question,
    history,
  });

  return {
    status: 200,
    body: {
      ...result,
      truth: result.shouldRevealTruth ? story.truth : undefined,
    },
  };
}