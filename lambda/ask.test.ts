import { beforeEach, describe, expect, it, vi } from "vitest";

const { handleAskRequestMock } = vi.hoisted(() => ({
  handleAskRequestMock: vi.fn(),
}));

vi.mock("@/lib/server/askHandler", () => ({
  handleAskRequest: handleAskRequestMock,
}));

import { handler } from "@/lambda/ask";

describe("Lambda質問判定ハンドラー", () => {
  beforeEach(() => {
    handleAskRequestMock.mockReset();
    handleAskRequestMock.mockResolvedValue({
      status: 200,
      body: {
        label: "yes",
        text: "はい。",
        shouldRevealTruth: false,
      },
    });
  });

  it("OPTIONSリクエストには204を返す", async () => {
    const response = await handler({
      requestContext: {
        http: {
          method: "OPTIONS",
        },
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
    expect(response.headers).toMatchObject({
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "OPTIONS,POST",
    });
    expect(handleAskRequestMock).not.toHaveBeenCalled();
  });

  it("POST以外のリクエストには405を返す", async () => {
    const response = await handler({
      requestContext: {
        http: {
          method: "GET",
        },
      },
    });

    expect(response.statusCode).toBe(405);
    expect(JSON.parse(response.body)).toEqual({
      error: "POSTメソッドで送信してください。",
    });
    expect(handleAskRequestMock).not.toHaveBeenCalled();
  });

  it("不正なJSONには400を返す", async () => {
    const response = await handler({
      body: "{",
      requestContext: {
        http: {
          method: "POST",
        },
      },
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      error: "JSON形式で送信してください。",
    });
    expect(handleAskRequestMock).not.toHaveBeenCalled();
  });

  it("正常なPOSTリクエストをhandleAskRequestへ渡す", async () => {
    const requestBody = {
      question: "ケーキを食べたのは女性ですか？",
      history: [],
    };

    const response = await handler({
      body: JSON.stringify(requestBody),
      requestContext: {
        http: {
          method: "POST",
        },
      },
    });

    expect(handleAskRequestMock).toHaveBeenCalledTimes(1);
    expect(handleAskRequestMock).toHaveBeenCalledWith(requestBody);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      label: "yes",
      text: "はい。",
      shouldRevealTruth: false,
    });
  });
});