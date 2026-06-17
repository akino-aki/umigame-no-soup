import type { SecretStory } from "@/lib/server/storyBank";

export type JudgeLabel = "yes" | "no" | "irrelevant" | "answer" | "unknown";

export type GameMessage = {
  role: "user" | "judge";
  text: string;
  label?: JudgeLabel;
};

export type JudgeRequest = {
  story: SecretStory;
  question: string;
  history: GameMessage[];
};

export type JudgeResponse = {
  label: JudgeLabel;
  text: string;
  shouldRevealTruth: boolean;
};

export type JudgeClient = (request: JudgeRequest) => Promise<JudgeResponse>;
