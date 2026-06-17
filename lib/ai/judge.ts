import { mockJudge } from "./mockJudge";
import type { JudgeClient } from "./types";

// 将来ここで Bedrock 実装に差し替える。
// 例: process.env.AI_PROVIDER === "bedrock" ? bedrockJudge : mockJudge
export function getJudgeClient(): JudgeClient {
  return mockJudge;
}
