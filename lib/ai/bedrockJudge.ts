import {
    BedrockRuntimeClient,
    ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

import type { JudgeClient } from "./types";

export const bedrockJudge: JudgeClient = async({story, question}) => {
    const region = process.env.AWS_REGION;
    const modelId = process.env.BEDROCK_MODEL_ID;

    if (!region) {
        throw new Error("AWS_REGIONが設定されていません。")
    };

    if (!modelId) {
        throw new Error("BEDROCK_MODEL_IDが設定されていません。") 
    }

    const client = new BedrockRuntimeClient({region});

    const command = new ConverseCommand({
        modelId,
        system:[
            {
        text: `
あなたは「ウミガメのスープ」の出題者です。

以下の問題と真相を理解したうえで、ユーザーの質問に回答してください。

問題文：
${story.problem}

真相：
${story.truth}

回答は、原則として次のいずれかを使って簡潔に答えてください。

- はい。
- いいえ。
- 関係ありません。
- どちらとも言い切れません。

真相を直接明かしたり、必要以上のヒントを出したりしないでください。
        `.trim(),
      },
    ],
    messages: [
        {
            role: "user",
            content: [{text: question}]
        },
    ],
    inferenceConfig: {
        maxTokens: 100,
        temperature: 0,
    }
    });

    const response = await client.send(command);

    const responseText = response.output?.message?.content?.[0]?.text?.trim();

    if (!responseText) {
        throw new Error("Bedrockから回答分を取得できませんでした。");
    }

    return {
        label: "unknown",
        text: responseText,
        shouldRevealTruth: false,
    };
};
