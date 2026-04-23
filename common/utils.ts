import { ModelConfiguration, V3Env } from "@browserbasehq/stagehand";
import { ModelConfig } from "@browserbasehq/stagehand/lib/v3/types/public/api.js";
import { z } from "zod";

const stagehandEnvSchema = z.enum(["LOCAL", "BROWSERBASE"]);

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name];

  return value ? value : undefined;
}

export function getStagehandEnv(): V3Env {
  return stagehandEnvSchema.parse(process.env.STAGEHAND_ENV);
}

export function getStagehandModel(): ModelConfiguration | undefined {
  return getOptionalEnv("STAGEHAND_MODEL");
}

export function getOpenAIApiKey(): string | undefined {
  return getOptionalEnv("OPENAI_API_KEY");
}

export function getGoogleApiKey(): string | undefined {
  return getOptionalEnv("GOOGLE_API_KEY");
}

export function getBrowserbaseApiKey(): string | undefined {
  return getOptionalEnv("BROWSERBASE_API_KEY");
}

export function getBrowserbaseProjectId(): string | undefined {
  return getOptionalEnv("BROWSERBASE_PROJECT_ID");
}

