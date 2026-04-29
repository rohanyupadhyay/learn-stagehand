// Run with: npm exec -- tsx examples/sauce_demo_act_variables.ts
// Run with delay: npm exec -- tsx examples/sauce_demo_act_variables.ts --add-delay
//
// This example opens Sauce Demo and uses Stagehand variables in `act`
// to fill the username and password fields.

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

const variables = {
  username: {
    value: "standard_user",
    description: "The Sauce Demo username to enter in the login form.",
  },
  password: {
    value: "secret_sauce",
    description: "The Sauce Demo password to enter in the login form.",
  },
};

/**
 * Opens Sauce Demo and uses Stagehand variables in `act` to fill the
 * username and password fields.
 */
async function main(): Promise<void> {
  // `userDataDir` points Chrome at a temporary automation profile. The helper
  // creates it with prompts disabled so local browser UI does not interrupt the
  // example, and the `finally` block removes it after Stagehand closes.
  const userDataDir = createAutomationUserDataDir(
    "stagehand-sauce-demo-act-variables-",
  );

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
    // cacheDir: "runtime/cache/sauce_demo_act_variables",
  });

  try {
    await stagehand.init();

    const page = stagehand.context.pages()[0];

    await page.goto(SAUCE_DEMO_URL);
    await delayAfterAction();
    await page.waitForLoadState("load", 15000);
    await delayAfterAction();

    const usernameResult = await stagehand.act(
      "Type %username% into the username field.",
      {
        variables: variables,
      },
    );
    await delayAfterAction();

    const passwordResult = await stagehand.act(
      "Type %password% into the password field.",
      {
        variables: variables,
      },
    );
    await delayAfterAction();

    console.log({
      usernameResult,
      passwordResult,
    });
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
