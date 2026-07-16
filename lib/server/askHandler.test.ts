import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GameMessage, JudgeRequest } from "@/lib/ai/types";
import { handleAskRequest } from "@/lib/server/askHandler";

const { judgeMock } = vi.hoisted(() => ({
  judgeMock: vi.fn(),
}));

vi.mock("@/lib/ai/judge", () => ({
  getJudgeClient: () => judgeMock,
}));

describe("handleAskRequest", () => {
  beforeEach(() => {
    judgeMock.mockReset();
    judgeMock.mockResolvedValue({
      label: "yes",
      text: "はい。",
      shouldRevealTruth: false,
    });
  });

  it("リクエスト本文がオブジェクトでない場合は400を返す", async () => {
    const result = await handleAskRequest(null);

    expect(result).toEqual({
      status: 400,
      body: {
        error: "JSON形式で送信してください。",
      },
    });
    expect(judgeMock).not.toHaveBeenCalled();
  });

  it("質問が空の場合は400を返す", async () => {
    const result = await handleAskRequest({
      question: "   ",
      history: [],
    });

    expect(result).toEqual({
      status: 400,
      body: {
        error: "質問を入力してください。",
      },
    });
    expect(judgeMock).not.toHaveBeenCalled();
  });

  it("質問が200文字を超える場合は400を返す", async () => {
    const result = await handleAskRequest({
      question: "あ".repeat(201),
      history: [],
    });

    expect(result).toEqual({
      status: 400,
      body: {
        error: "質問は200文字以内にしてください。",
      },
    });
    expect(judgeMock).not.toHaveBeenCalled();
  });

  it("会話履歴は末尾の20件だけを判定処理へ渡す", async () => {
    const history: GameMessage[] = Array.from(
      { length: 21 },
      (_, index) => ({
        role: "user",
        text: `質問${index + 1}`,
      }),
    );

    const result = await handleAskRequest({
      question: "ケーキを食べたのは女性ですか？",
      history,
    });

    expect(result.status).toBe(200);
    expect(judgeMock).toHaveBeenCalledTimes(1);

    const request = judgeMock.mock.calls[0][0] as JudgeRequest;

    expect(request.history).toHaveLength(20);
    expect(request.history[0].text).toBe("質問2");
    expect(request.history[19].text).toBe("質問21");
  });
});