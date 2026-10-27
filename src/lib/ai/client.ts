import Anthropic from "@anthropic-ai/sdk";
import { env, isAiEnabled } from "@/lib/env";

/**
 * Thin wrapper around the Anthropic Claude API.
 *
 * Responsibilities:
 *  - lazily create the client (so the app boots without an API key),
 *  - request *structured* output via a forced tool call (Claude's most
 *    reliable way to return JSON),
 *  - transparently fall back to a list of known model ids when the configured
 *    model is not available for the current account,
 *  - normalise errors into `AiError` so route handlers can return friendly
 *    messages instead of stack traces.
 */

export class AiError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly code = "AI_ERROR",
  ) {
    super(message);
    this.name = "AiError";
  }
}

let cachedClient: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!env.anthropicApiKey) {
    throw new AiError(
      "The Claude API is not configured. Add ANTHROPIC_API_KEY to your environment to enable AI features.",
      503,
      "AI_NOT_CONFIGURED",
    );
  }
  if (!cachedClient) {
    cachedClient = new Anthropic({ apiKey: env.anthropicApiKey });
  }
  return cachedClient;
}

/** Candidate model ids, tried in order when the primary one is unavailable. */
const MODEL_FALLBACKS = [
  env.anthropicModel,
  "claude-sonnet-5-5",
  "claude-sonnet-5",
  "claude-sonnet-4-6",
  "claude-sonnet-4-5-20250929",
].filter(Boolean) as string[];

/**
 * The Anthropic API v1 removed `temperature` in favour of an `effort` level on
 * `output_config`. We keep a familiar "creativity" knob internally and map it
 * onto the effort scale.
 */
function effortFor(creativity: number): "low" | "medium" | "high" | "xhigh" {
  if (creativity <= 0.2) return "low";
  if (creativity <= 0.5) return "medium";
  if (creativity <= 0.8) return "high";
  return "xhigh";
}

export interface ClaudeJsonOptions {
  /** System prompt that frames Claude's role and the output contract. */
  system: string;
  /** The user content (the task). */
  prompt: string;
  /** Name of the forced tool that carries the JSON payload. */
  toolName: string;
  /** What the tool produces (shown to the model). */
  toolDescription: string;
  /** JSON Schema for the tool input. */
  schema: Record<string, unknown>;
  maxTokens?: number;
  /** 0 (focused) → 1 (creative). Mapped onto the API's effort scale. */
  creativity?: number;
}

/**
 * Ask Claude for a JSON object matching `schema`.
 *
 * Uses a forced tool call so the response is always parseable JSON — no
 * regex, no "strip the markdown fences" heuristics.
 */
export async function claudeJson<T>({
  system,
  prompt,
  toolName,
  toolDescription,
  schema,
  maxTokens = 4000,
  creativity = 0.4,
}: ClaudeJsonOptions): Promise<T> {
  const client = getAnthropic();
  let lastError: unknown = null;

  for (const model of MODEL_FALLBACKS) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        tools: [
          {
            name: toolName,
            description: toolDescription,
            input_schema: schema as Anthropic.Tool.InputSchema,
          },
        ],
        // Force the model to call the tool: guarantees structured output.
        tool_choice: { type: "tool", name: toolName },
        output_config: { effort: effortFor(creativity) },
        messages: [{ role: "user", content: prompt }],
      });

      const toolUse = response.content.find((block) => block.type === "tool_use");
      if (!toolUse || toolUse.type !== "tool_use") {
        throw new AiError("Claude did not return structured output.", 502, "AI_INVALID_RESPONSE");
      }
      return toolUse.input as T;
    } catch (error) {
      lastError = error;

      // Only retry on a "model not found" style error.
      const status = (error as { status?: number })?.status;
      const message = error instanceof Error ? error.message : String(error);
      const modelMissing = status === 404 || /model.*not found|invalid model/i.test(message);
      if (!modelMissing) break;
    }
  }

  const status = (lastError as { status?: number })?.status;
  if (status === 401) {
    throw new AiError("Your Anthropic API key was rejected. Check ANTHROPIC_API_KEY.", 401, "AI_UNAUTHORIZED");
  }
  if (status === 429) {
    throw new AiError("The Claude API rate limit was hit. Please try again in a moment.", 429, "AI_RATE_LIMITED");
  }
  if (lastError instanceof AiError) throw lastError;

  throw new AiError(
    lastError instanceof Error ? lastError.message : "The AI request failed.",
    502,
    "AI_REQUEST_FAILED",
  );
}

/** True when the app is running without a Claude key (demo responses). */
export const aiAvailable = isAiEnabled;
