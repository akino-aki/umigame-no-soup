"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { PublicStory } from "@/lib/server/storyBank";
import type { GameMessage, JudgeLabel } from "@/lib/ai/types";

type AskResponse = {
  label: JudgeLabel;
  text: string;
  shouldRevealTruth: boolean;
  truth?: string;
  error?: string;
};

type Props = {
  story: PublicStory;
};

const labelText: Record<JudgeLabel, string> = {
  yes: "はい",
  no: "いいえ",
  irrelevant: "関係なし",
  answer: "正解",
  unknown: "不明",
};

export function Game({ story }: Props) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [truth, setTruth] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, truth]);

  useEffect(() => {
    if (!isLoading && !truth) {
      inputRef.current?.focus();
    }
  }, [isLoading, truth]);

  const questionCount = useMemo(
    () => messages.filter((message) => message.role === "user").length,
    [messages],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isLoading || truth) return;

    const nextMessages: GameMessage[] = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setQuestion("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("./api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, history: messages }),
      });
      const data = (await response.json()) as AskResponse;

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "判定に失敗しました。");
      }

      setMessages([
        ...nextMessages,
        {
          role: "judge",
          text: data.text,
          label: data.label,
        },
      ]);

      if (data.shouldRevealTruth && data.truth) {
        setTruth(data.truth);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました。");
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  }

  function resetGame() {
    setQuestion("");
    setMessages([]);
    setTruth(null);
    setError(null);
  }

  return (
    <section className="gameCard">
      <div className="storyPanel">
        <div className="storyHeader">
          <div>
            <p className="eyebrow">Question</p>
            <h2>{story.title}</h2>
          </div>
          <span className="counter">質問 {questionCount} 回</span>
        </div>

        <p className="problem">{story.problem}</p>
      </div>

      <div className="chatArea">
        {error && <p className="error">{error}</p>}

        <div className="suggestions" aria-label="質問例">
          {["誰かに盗まれましたか？", "食べたのは女性本人ですか？", "女性は前日の夜に食べましたか？"].map(
            (sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setQuestion(sample)}
                disabled={isLoading || Boolean(truth)}
              >
                {sample}
              </button>
            ),
          )}
        </div>

        <div className="log">
          {messages.length === 0 ? (
            <p className="empty">まだ質問はありません。はい/いいえで答えられる質問から始めてみてください。</p>
          ) : (
            messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`message ${message.role}`}>
                <span className="speaker">{message.role === "user" ? "あなた" : "出題者"}</span>
                <p>{message.text}</p>
                {message.label && <span className={`badge ${message.label}`}>{labelText[message.label]}</span>}
              </div>
            ))
          )}
        </div>

        {truth && (
          <div className="truthBox">
            <p className="eyebrow">Truth</p>
            <h3>真相</h3>
            <p>{truth}</p>
          </div>
        )}

        <div ref={logEndRef} />
      </div>

      <form className="questionForm" onSubmit={handleSubmit}>
        <label htmlFor="question">質問する</label>
        <div className="inputRow">
          <input
            ref={inputRef}
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="例：ケーキを食べたのは女性本人ですか？"
            maxLength={200}
            disabled={isLoading || Boolean(truth)}
          />
          <button type="submit" disabled={isLoading || !question.trim() || Boolean(truth)}>
            {isLoading ? "判定中..." : "聞く"}
          </button>
        </div>
      </form>

      <button className="resetButton" type="button" onClick={resetGame}>
        最初から遊ぶ
      </button>
    </section>
  );
}
