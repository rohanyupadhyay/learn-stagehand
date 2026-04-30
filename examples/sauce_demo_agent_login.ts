// Run with: npm exec -- tsx examples/sauce_demo_agent_login.ts
// Run with delay: npm exec -- tsx examples/sauce_demo_agent_login.ts --add-delay
//
// This example uses Stagehand's agent API to log into Sauce Demo with
// provided credentials.

import "dotenv/config";

import { Stagehand } from "@browserbasehq/stagehand";
import process from "node:process";
import { z } from "zod";
import {
  createAutomationUserDataDir,
  removeAutomationUserDataDir,
} from "../common/chromeAutomationProfile.js";
import { delayAfterAction } from "../common/delay.js";
import { getStagehandEnv, getStagehandModel } from "../common/utils.js";

const SAUCE_DEMO_URL = "https://www.saucedemo.com/";
const VIEWPORT = { width: 1440, height: 960 };

const env = getStagehandEnv();
const model = getStagehandModel();

const instruction =
  "Log in using the provided Sauce Demo credentials.";

const variables = {
  username: {
    value: "standard_user",
    description: "The Sauce Demo username.",
  },
  password: {
    value: "secret_sauce",
    description: "The Sauce Demo password.",
  },
};

/**
 * Logs into Sauce Demo with Stagehand agent and extracts the visible product
 * names and prices from the inventory page.
 */
async function main(): Promise<void> {
  // `userDataDir` points Chrome at a temporary automation profile. The helper
  // creates it with prompts disabled so local browser UI does not interrupt the
  // example, and the `finally` block removes it after Stagehand closes.
  const userDataDir = createAutomationUserDataDir(
    "stagehand-sauce-demo-extract-",
  );

  // Create one Stagehand client.
  const stagehand = new Stagehand({
    env, // LOCAL or BROWSERBASE
    model, // e.g. "google/gemini-2.5-pro", "openai/gpt-4o", etc.
    experimental: true, // true for hybrid mode, false for DOM or CUA mode.
    verbose: 0,
    localBrowserLaunchOptions: {
      userDataDir, // Chrome profile directory
      viewport: VIEWPORT, // Browser window size
    },
    // cacheDir: "runtime/cache/sauce_demo_extract",
  });

  try {
    await stagehand.init();

    const page = stagehand.context.pages()[0];
    await page.goto(SAUCE_DEMO_URL);
    await delayAfterAction();

    const agent = stagehand.agent({
      mode: "hybrid", // "dom", "cua", or "hybrid". Default is "dom".
      model,
    });

    const result = await agent.execute({
      instruction,
      variables,
    });
    await delayAfterAction();

    console.log(result);


  } finally {
    await stagehand.close();

    // Remove the temporary Chrome profile created for this automation run.
    removeAutomationUserDataDir(userDataDir);
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
