import type { JudgeClient, JudgeLabel } from "./types";

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function looksLikeQuestion(text: string): boolean {
  return /[？?]|ですか|ますか|なの|でしょうか|したか|いる|ある|ない/.test(text);
}

function isAskingForAnswer(text: string): boolean {
  return /答え|正解|真相|ネタバレ|降参|ギブアップ|give up|reveal/i.test(text);
}

function detectLabel(question: string, story: Parameters<JudgeClient>[0]["story"]): JudgeLabel {
  const normalized = question.trim().toLowerCase();

  if (isAskingForAnswer(normalized)) return "answer";
  if (includesAny(normalized, story.irrelevantKeywords)) return "irrelevant";

  const answerHitCount = story.answerKeywords.filter((keyword) => normalized.includes(keyword)).length;
  if (answerHitCount >= 3) return "answer";

  if (includesAny(normalized, story.yesKeywords)) return "yes";
  if (includesAny(normalized, story.noKeywords)) return "no";
  if (!looksLikeQuestion(normalized)) return "unknown";

  // MVP用の保守的なデフォルト。実AI化したらここがモデル判定になる。
  return "unknown";
}

export const mockJudge: JudgeClient = async ({ story, question }) => {
  const label = detectLabel(question, story);

  switch (label) {
    case "answer":
      return {
        label,
        text: "かなり核心に近いです。正解として扱ってよさそうです。",
        shouldRevealTruth: true,
      };
    case "yes":
      return {
        label,
        text: "はい。",
        shouldRevealTruth: false,
      };
    case "no":
      return {
        label,
        text: "いいえ。",
        shouldRevealTruth: false,
      };
    case "irrelevant":
      return {
        label,
        text: "関係ありません。",
        shouldRevealTruth: false,
      };
    default:
      return {
        label,
        text: "どちらとも言い切れません。質問をもう少し具体的にしてみてください。",
        shouldRevealTruth: false,
      };
  }
};
