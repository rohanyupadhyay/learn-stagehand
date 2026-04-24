// Run with: npm exec -- tsx examples/sauce_demo_act_variables.ts
//
// This example opens Sauce Demo and uses a Stagehand variable in `act`
// to fill the password field.

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

const variables = {
  password: {
    value: "secret_sauce",
    description: "The Sauce Demo password to enter in the login form.",
  },
};

/**
 * Opens Sauce Demo and uses a Stagehand variable in `act` to fill the
 * password field.
 */
async function main(): Promise<void> {
  const userDataDir = createAutomationUserDataDir(
    "stagehand-sauce-demo-act-variables-",
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
    // cacheDir: "runtime/cache/sauce_demo_act_variables",
  });

  try {
    await stagehand.init();

    const page = stagehand.context.pages()[0];

    await page.goto(SAUCE_DEMO_URL);
    await page.waitForLoadState("load", 15000);

    const result = await stagehand.act(
      "Type %password% into the password field.",
      {
        variables: variables,
      },
    );

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
