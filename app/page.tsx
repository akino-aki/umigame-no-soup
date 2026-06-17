import { Game } from "@/components/Game";
import { getPublicStory } from "@/lib/server/storyBank";

export default function Home() {
  const story = getPublicStory();

  return (
    <main className="pageShell">
      <section className="hero">
        <p className="eyebrow">Lateral Thinking Soup</p>
        <h1>ウミガメのスープ</h1>
        <p className="lead">AI出題者に「はい / いいえ」で答えられる質問を投げて、真相を推理してください。</p>
      </section>
      <Game story={story} />
    </main>
  );
}
