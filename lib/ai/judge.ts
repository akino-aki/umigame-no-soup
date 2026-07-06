import { bedrockJudge } from "./bedrockJudge";
import { mockJudge } from "./mockJudge";
import type { JudgeClient } from "./types";

// 将来ここで Bedrock 実装に差し替える。
// 例: process.env.AI_PROVIDER === "bedrock" ? bedrockJudge : mockJudge
export function getJudgeClient(): JudgeClient {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (!provider || provider === "mock") {
    return mockJudge;
  }

  if (provider === "bedrock") {
    return bedrockJudge;
  }

  throw new Error (`未対応のAI_PROVIDERです：${provider}`);
}
