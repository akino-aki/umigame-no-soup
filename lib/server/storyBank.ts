export type PublicStory = {
  id: string;
  title: string;
  problem: string;
};

export type SecretStory = PublicStory & {
  truth: string;
  facts: string[];
  answerKeywords: string[];
  yesKeywords: string[];
  noKeywords: string[];
  irrelevantKeywords: string[];
};

const story: SecretStory = {
  id: "missing-cake",
  title: "消えたケーキ",
  problem:
    "ある女性は、楽しみにしていたケーキを冷蔵庫から取り出そうとしました。しかし、箱の中身は空でした。女性は怒るどころか、少し笑ってから新しいケーキを買いに行きました。なぜでしょう？",
  truth:
    "ケーキは女性自身が前日の夜に食べていた。寝ぼけていたため忘れており、空箱を見てから自分で食べたことを思い出した。誰かに盗まれたわけではなかった。",
  facts: [
    "ケーキは盗まれていない",
    "ケーキを食べたのは女性本人",
    "女性は前日の夜に寝ぼけながら食べた",
    "空箱を見て、自分で食べたことを思い出した",
    "だから怒らず、笑って買い直した",
  ],
  answerKeywords: ["自分", "本人", "女性", "寝ぼけ", "忘れ", "前日", "夜", "食べた"],
  yesKeywords: ["自分", "本人", "女性", "寝ぼけ", "忘れ", "前日", "夜", "食べた", "思い出", "買い直"],
  noKeywords: ["泥棒", "盗", "彼氏", "夫", "子ども", "家族", "店員", "腐", "賞味期限", "落と", "捨て", "犬", "猫"],
  irrelevantKeywords: ["天気", "仕事", "会社", "電車", "学校", "宇宙", "魔法", "病院"],
};

export function getPublicStory(): PublicStory {
  return {
    id: story.id,
    title: story.title,
    problem: story.problem,
  };
}

export function getSecretStory(): SecretStory {
  return story;
}
