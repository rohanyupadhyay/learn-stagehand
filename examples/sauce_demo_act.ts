// Run with: npm exec -- tsx examples/sauce_demo_act.ts

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
 * Opens the Sauce Demo landing page and uses Stagehand act to type into the
 * username field.
 */
async function main(): Promise<void> {
  const userDataDir = createAutomationUserDataDir("stagehand-sauce-demo-act-");

  const stagehand = new Stagehand({
    env,
    model,
    experimental: true,
    verbose: 0,
    localBrowserLaunchOptions: {
      userDataDir,
      viewport: VIEWPORT,
    },
    cacheDir: "runtime/cache/sauce_demo_act",
  });

  try {
    await stagehand.init();

    const page = stagehand.context.pages()[0];

    await page.goto(SAUCE_DEMO_URL);

    // Wait for the page to finish loading.
    await page.waitForLoadState("load", 15000);

    const result = await stagehand.act('Type "John" into the username field.');

    console.log(result);
  } finally {
    await stagehand.close();
    removeAutomationUserDataDir(userDataDir);
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
