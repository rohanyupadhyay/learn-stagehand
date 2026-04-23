// Run with: npm exec -- tsx examples/sauce_demo_observe.ts

import "dotenv/config";

import { Stagehand } from "@browserbasehq/stagehand";
import process from "node:process";
import {
  createAutomationUserDataDir,
  removeAutomationUserDataDir,
} from "../common/chromeAutomationProfile.js";
import { getStagehandEnv, getStagehandModel } from "../common/utils.js";

const SAUCE_DEMO_URL = "https://www.saucedemo.com/";
const VIEWPORT = { width: 1440, height: 960 };

const env = getStagehandEnv();
const model = getStagehandModel();

/**
 * Opens the Sauce Demo landing page and asks Stagehand to observe the input
 * fields available on the page.
 */
async function main(): Promise<void> {
  const userDataDir = createAutomationUserDataDir(
    "stagehand-sauce-demo-observe-",
  );

  const stagehand = new Stagehand({
    env,
    model,
    experimental: true,
    verbose: 0,
    localBrowserLaunchOptions: {
      userDataDir,
      viewport: VIEWPORT,
    },
    cacheDir: "runtime/cache/sauce_demo_observe",
  });

  try {
    await stagehand.init();

    const page = stagehand.context.pages()[0];

    await page.goto(SAUCE_DEMO_URL);

    // Wait for the page to finish loading.
    await page.waitForLoadState("load", 15000);

    const observedActions = await stagehand.observe("Find all input fields.");

    console.log("Observed input-field actions:");
    console.log(JSON.stringify(observedActions, null, 2));
  } finally {
    await stagehand.close();
    removeAutomationUserDataDir(userDataDir);
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
