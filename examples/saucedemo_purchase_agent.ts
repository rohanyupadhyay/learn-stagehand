// Run with: npm exec -- tsx examples/saucedemo_purchase_agent.ts

import "dotenv/config";

import { Stagehand } from "@browserbasehq/stagehand";
import process from "node:process";
import { z } from "zod";
import {
  createAutomationUserDataDir,
  removeAutomationUserDataDir,
} from "../common/chromeAutomationProfile.js";
import {
  getStagehandEnv,
  getStagehandModel,
} from "../common/utils.js";

// A wide viewport makes the demo flow more stable and easier to watch locally.
const VIEWPORT = { width: 1440, height: 960 };

// Read the shared Stagehand configuration for this example from `.env`.
const env = getStagehandEnv();
const model = getStagehandModel();

// This is the natural-language goal we hand to the agent.
const instruction = `Go to https://www.saucedemo.com/ and purchase a backpack and a bike light.`;

// Variables let the agent refer to structured input data in its instructions.
const variables = {
  username: {
    value: "standard_user",
    description: "The Sauce Demo username.",
  },
  password: {
    value: "secret_sauce",
    description: "The Sauce Demo password.",
  },
  firstName: {
    value: "Jane",
    description: "The checkout first name.",
  },
  lastName: {
    value: "Doe",
    description: "The checkout last name.",
  },
  postalCode: {
    value: "94043",
    description: "The checkout postal code.",
  },
};

// Define the exact structured result this example should return.
const output = z.object({
  confirmationMessage: z
    .string()
    .describe("The checkout confirmation message shown by Sauce Demo."),
  purchasedItems: z
    .array(z.string())
    .describe("The item names visible in the checkout overview."),
});

/**
 * Runs a full Sauce Demo checkout flow with Stagehand's agent API.
 */
async function main(): Promise<void> {
  const userDataDir = createAutomationUserDataDir(
    "stagehand-sauce-demo-profile-",
  );

  // Use a temporary Chrome profile so local runs avoid browser prompts that
  // can interfere with automation.
  const stagehand = new Stagehand({
    env,
    experimental: true,
    model,
    verbose: 0,
    localBrowserLaunchOptions: {
      userDataDir,
      viewport: VIEWPORT,
    },
    // cacheDir: "runtime/cache/saucedemo_with_agent",
  });

  try {
    await stagehand.init();

    // The hybrid agent can mix direct browser actions with reasoning steps.
    const agent = stagehand.agent({
      mode: "hybrid",
      model,
      systemPrompt:
        "You are a careful browser automation assistant. Complete only the requested demo-site workflow and stop after the final confirmation page is reached.",
    });

    const result = await agent.execute({
      instruction,
      variables,
      output,
    });

    // Print the structured output payload.
    console.log("Structured output:");
    console.log(JSON.stringify(result.output, null, 2));
  } finally {
    await stagehand.close();
    removeAutomationUserDataDir(userDataDir);
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
