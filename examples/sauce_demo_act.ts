// Run with: npm exec -- tsx examples/sauce_demo_act.ts
// Run with delay: npm exec -- tsx examples/sauce_demo_act.ts --add-delay
//
// This example opens the Sauce Demo landing page and uses Stagehand `act`
// to type into the username field.

import "dotenv/config";

import { Stagehand } from "@browserbasehq/stagehand";
import process from "node:process";
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

/**
 * Opens the Sauce Demo landing page and uses Stagehand act to type into the
 * username field.
 */
async function main(): Promise<void> {
  // `userDataDir` points Chrome at a temporary automation profile. The helper
  // creates it with prompts disabled so local browser UI does not interrupt the
  // example, and the `finally` block removes it after Stagehand closes.
  const userDataDir = createAutomationUserDataDir("stagehand-sauce-demo-act-");

  // Create one Stagehand client.
  const stagehand = new Stagehand({
    env, // LOCAL or BROWSERBASE
    model, // e.g. "google/gemini-2.5-pro", "openai/gpt-4o", etc.
    experimental: true,
    verbose: 0,
    localBrowserLaunchOptions: {
      userDataDir, // Chrome profile directory
      viewport: VIEWPORT,
    },
    // cacheDir: "runtime/cache/sauce_demo_act",
  });

  try {
    await stagehand.init();

    const page = stagehand.context.pages()[0];

    await page.goto(SAUCE_DEMO_URL);
    await delayAfterAction();

    // Wait for the page to finish loading.
    await page.waitForLoadState("load", 15000);
    await delayAfterAction();

    const result = await stagehand.act('Type "John" into the username field.');
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
