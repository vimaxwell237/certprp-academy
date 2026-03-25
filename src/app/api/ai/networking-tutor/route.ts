import { NextRequest, NextResponse } from "next/server";

import { saveAiTutorSession } from "@/features/ai-tutor/data/ai-tutor-service";
import { buildTutorFallbackResponse } from "@/features/ai-tutor/lib/dev-fallback";
import { NETWORKING_TUTOR_SYSTEM_PROMPT } from "@/features/ai-tutor/lib/networking-tutor-prompt";
import {
  checkSlidingWindowRateLimit,
  isTrustedRequestOrigin
} from "@/lib/http/request-security";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const AI_TUTOR_RESPONSE_HEADERS = {
  "Cache-Control": "no-store"
} as const;
const MAX_QUESTION_LENGTH = 1500;
const MAX_CONTEXT_LENGTH = 240;
const AI_TUTOR_RATE_LIMIT = {
  limit: 12,
  windowMs: 60_000
} as const;

type OpenAiResponsesApiResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

type GitHubModelsChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

async function readJsonOrTextResponse<T>(response: Response): Promise<{
  json: T | null;
  text: string;
}> {
  const text = await response.text();
  const trimmed = text.trim();

  if (!trimmed) {
    return {
      json: null,
      text: ""
    };
  }

  try {
    return {
      json: JSON.parse(trimmed) as T,
      text: trimmed
    };
  } catch {
    return {
      json: null,
      text: trimmed
    };
  }
}

function buildTutorUserPrompt(input: {
  question: string;
  lessonContext?: string | null;
}) {
  const contextBlock = input.lessonContext
    ? `Lesson or tool context: ${input.lessonContext}\n\n`
    : "";

  return `${contextBlock}Student question: ${input.question.trim()}`;
}

function extractOutputText(payload: OpenAiResponsesApiResponse) {
  if (payload.output_text?.trim()) {
    return payload.output_text.trim();
  }

  const parts =
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text" && typeof item.text === "string")
      .map((item) => item.text?.trim() ?? "")
      .filter(Boolean) ?? [];

  return parts.join("\n\n").trim();
}

function extractGitHubModelsText(payload: GitHubModelsChatCompletionsResponse) {
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => item.text?.trim() ?? "")
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }

  return "";
}

async function getAuthenticatedUserId() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

function jsonNoStore(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    headers: AI_TUTOR_RESPONSE_HEADERS,
    status
  });
}

function isRateLimited(status: number, message: string) {
  const normalized = message.toLowerCase();

  return (
    status === 429 ||
    normalized.includes("too many requests") ||
    normalized.includes("rate limit") ||
    normalized.includes("quota")
  );
}

function buildDevFallbackPayload(input: {
  question: string;
  lessonContext?: string | null;
  providerLabel: string;
}) {
  return {
    answer: buildTutorFallbackResponse(input),
    persistenceWarning: `${input.providerLabel} is rate-limited right now, so the AI tutor is using a built-in development fallback response.`
  };
}

export async function POST(request: NextRequest) {
  if (!isTrustedRequestOrigin(request)) {
    return jsonNoStore({ error: "Cross-site requests are not allowed." }, 403);
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonNoStore({ error: "Unauthorized." }, 401);
  }

  const rateLimit = checkSlidingWindowRateLimit({
    key: `ai-tutor:${userId}`,
    ...AI_TUTOR_RATE_LIMIT
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many AI tutor requests. Please wait a moment and try again."
      },
      {
        headers: {
          ...AI_TUTOR_RESPONSE_HEADERS,
          "Retry-After": String(rateLimit.retryAfterSeconds)
        },
        status: 429
      }
    );
  }

  const githubToken = process.env.GITHUB_TOKEN;
  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (!githubToken && !openAiApiKey) {
    return jsonNoStore(
      {
        error:
          "No AI provider key is configured. Set GITHUB_TOKEN for GitHub Models or OPENAI_API_KEY for OpenAI."
      },
      503
    );
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      user_question?: string;
      lesson_context?: string | null;
    } | null;

    if (!body || typeof body !== "object") {
      return jsonNoStore({ error: "Invalid request body." }, 400);
    }

    const question = String(body.user_question ?? "").trim();
    const lessonContext = body.lesson_context
      ? String(body.lesson_context).trim().slice(0, MAX_CONTEXT_LENGTH)
      : null;

    if (!question) {
      return jsonNoStore({ error: "Please enter a networking question." }, 400);
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return jsonNoStore(
        {
          error: `Please keep questions under ${MAX_QUESTION_LENGTH} characters so the tutor can respond clearly.`
        },
        400
      );
    }

    let answer = "";

    if (githubToken) {
      const response = await fetch("https://models.github.ai/inference/chat/completions", {
        cache: "no-store",
        method: "POST",
        signal: AbortSignal.timeout(15_000),
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        body: JSON.stringify({
          model: process.env.GITHUB_MODELS_MODEL ?? "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: NETWORKING_TUTOR_SYSTEM_PROMPT
            },
            {
              role: "user",
              content: buildTutorUserPrompt({
                question,
                lessonContext
              })
            }
          ]
        })
      });
      const { json: payload, text } =
        await readJsonOrTextResponse<GitHubModelsChatCompletionsResponse>(response);

      if (!response.ok) {
        const message =
          payload?.error?.message ??
          (text || "GitHub Models could not generate a response.");

        if (process.env.NODE_ENV !== "production" && isRateLimited(response.status, message)) {
          return jsonNoStore(
            buildDevFallbackPayload({
              question,
              lessonContext,
              providerLabel: "GitHub Models"
            })
          );
        }

        return jsonNoStore(
          {
            error:
              response.status === 429
                ? "GitHub Models rate limit reached. Use a token with models:read, reduce request frequency, switch to a lighter model like openai/gpt-4o-mini, or enable paid usage."
                : process.env.NODE_ENV === "production"
                  ? "The AI tutor is temporarily unavailable. Please try again shortly."
                  : message
          },
          response.status
        );
      }

      answer = payload ? extractGitHubModelsText(payload) : text;
    } else {
      const response = await fetch("https://api.openai.com/v1/responses", {
        cache: "no-store",
        method: "POST",
        signal: AbortSignal.timeout(15_000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_TUTOR_MODEL ?? "gpt-5-mini",
          instructions: NETWORKING_TUTOR_SYSTEM_PROMPT,
          input: buildTutorUserPrompt({
            question,
            lessonContext
          }),
          max_output_tokens: 700
        })
      });

      const { json: payload, text } =
        await readJsonOrTextResponse<OpenAiResponsesApiResponse>(response);

      if (!response.ok) {
        const message =
          payload?.error?.message ??
          (text || "The AI tutor could not generate a response.");

        if (process.env.NODE_ENV !== "production" && isRateLimited(response.status, message)) {
          return jsonNoStore(
            buildDevFallbackPayload({
              question,
              lessonContext,
              providerLabel: "OpenAI"
            })
          );
        }

        return jsonNoStore(
          {
            error:
              process.env.NODE_ENV === "production"
                ? "The AI tutor is temporarily unavailable. Please try again shortly."
                : message
          },
          response.status
        );
      }

      answer = payload ? extractOutputText(payload) : text;
    }

    if (!answer) {
      return jsonNoStore(
        { error: "The AI tutor returned an empty response. Please try again." },
        502
      );
    }

    let persistenceWarning: string | null = null;

    try {
      await saveAiTutorSession(userId, {
        question,
        response: answer,
        lessonContext
      });
    } catch (saveError) {
      persistenceWarning =
        saveError instanceof Error ? saveError.message : "Unable to save AI tutor history.";
    }

    return jsonNoStore({
      answer,
      persistenceWarning
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process the AI tutor request.";

    return jsonNoStore(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "The AI tutor is temporarily unavailable. Please try again shortly."
            : message
      },
      500
    );
  }
}
