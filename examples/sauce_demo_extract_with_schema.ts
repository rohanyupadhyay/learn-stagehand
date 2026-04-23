// Run with: npm exec -- tsx examples/sauce_demo_extract_with_schema.ts

import "dotenv/config";

import { Stagehand } from "@browserbasehq/stagehand";
import process from "node:process";
import { z } from "zod";
import {
  createAutomationUserDataDir,
  removeAutomationUserDataDir,
} from "../common/chromeAutomationProfile.js";
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
  const userDataDir = createAutomationUserDataDir(
    "stagehand-sauce-demo-extract-",
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
    // cacheDir: "runtime/cache/sauce_demo_extract",
  });

  try {
    await stagehand.init();

    const page = stagehand.context.pages()[0];
    await page.goto(SAUCE_DEMO_URL);

    const agent = stagehand.agent({
      mode: "hybrid",
      model,
    });

    await agent.execute({
      instruction,
      variables,
    });


    await page.waitForLoadState("load", 15000);

    const { products } = await stagehand.extract(
      "Extract the name and price of all visible products on this inventory page.",
      z.object({
        products: z
          .array(
            z.object({
              name: z.string().describe("The visible product name."),
              price: z
                .number()
                .describe("The visible product price as a decimal number."),
            }),
          )
          .describe("The visible Sauce Demo products in page order"),
      }),
    );

    console.log(products);
  } finally {
    await stagehand.close();
    removeAutomationUserDataDir(userDataDir);
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
