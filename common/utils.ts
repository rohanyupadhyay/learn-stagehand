import { ModelConfiguration, V3Env } from "@browserbasehq/stagehand";
import { z } from "zod";

/**
 * Runtime validator for the Stagehand execution environment.
 *
 * Environment variables are always strings at runtime, so examples use this
 * schema to narrow `STAGEHAND_ENV` to the values Stagehand accepts.
 */
const stagehandEnvSchema = z.enum(["LOCAL", "BROWSERBASE"]);

/**
 * Reads an environment variable that must be present for the current script.
 */
function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

/**
 * Reads an optional environment variable and normalizes empty strings to
 * `undefined` so example code can use simple fallback logic.
 */
export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name];

  return value ? value : undefined;
}

/**
 * Returns the Stagehand environment after validating it against the runtime
 * values supported by the SDK.
 */
export function getStagehandEnv(): V3Env {
  return stagehandEnvSchema.parse(process.env.STAGEHAND_ENV);
}

/**
 * Returns the configured Stagehand model, if one was supplied in `.env`.
 */
export function getStagehandModel(): ModelConfiguration | undefined {
  return getOptionalEnv("STAGEHAND_MODEL");
}

/**
 * Returns the OpenAI API key used by examples that target OpenAI-hosted models.
 */
export function getOpenAIApiKey(): string | undefined {
  return getOptionalEnv("OPENAI_API_KEY");
}

/**
 * Returns the Google API key used by examples that target Gemini models.
 */
export function getGoogleApiKey(): string | undefined {
  return getOptionalEnv("GOOGLE_API_KEY");
}

/**
 * Returns the Browserbase API key used when examples run in Browserbase mode.
 */
export function getBrowserbaseApiKey(): string | undefined {
  return getOptionalEnv("BROWSERBASE_API_KEY");
}

/**
 * Returns the Browserbase project identifier used with Browserbase sessions.
 */
export function getBrowserbaseProjectId(): string | undefined {
  return getOptionalEnv("BROWSERBASE_PROJECT_ID");
}
