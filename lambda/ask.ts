import { handleAskRequest } from "@/lib/server/askHandler";

type HttpApiEvent = {
  body?: string | null;
  isBase64Encoded?: boolean;
  requestContext?: {
    http?: {
      method?: string;
    };
  };
};

type LambdaResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CORS_ALLOW_ORIGIN ?? "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
};

function jsonResponse(statusCode: number, body: unknown): LambdaResponse {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  };
}

function noContentResponse(): LambdaResponse {
  return {
    statusCode: 204,
    headers: corsHeaders,
    body: "",
  };
}

function parseEventBody(event: HttpApiEvent): unknown {
  const rawBody = event.body ?? "{}";

  const bodyText = event.isBase64Encoded
    ? Buffer.from(rawBody, "base64").toString("utf-8")
    : rawBody;

  return JSON.parse(bodyText);
}

export async function handler(event: HttpApiEvent): Promise<LambdaResponse> {
  const method = event.requestContext?.http?.method;

  if (method === "OPTIONS") {
    return noContentResponse();
  }

  if (method && method !== "POST") {
    return jsonResponse(405, {
      error: "POSTメソッドで送信してください。",
    });
  }

  let body: unknown;

  try {
    body = parseEventBody(event);
  } catch {
    return jsonResponse(400, {
      error: "JSON形式で送信してください。",
    });
  }

  const result = await handleAskRequest(body);

  return jsonResponse(result.status, result.body);
}