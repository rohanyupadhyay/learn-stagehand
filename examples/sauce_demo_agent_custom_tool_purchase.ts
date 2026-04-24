// Run with: npm exec -- tsx examples/sauce_demo_agent_custom_tool_purchase.ts
//
// This example gives Stagehand's agent a custom `check_requirement` tool
// that returns the Sauce Demo product names to purchase.

import "dotenv/config";

import { Stagehand } from "@browserbasehq/stagehand";
import { tool } from "ai";
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

const VIEWPORT = { width: 1440, height: 960 };

const env = getStagehandEnv();
const model = getStagehandModel();

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

const requiredItems = ["Sauce Labs Backpack", "Sauce Labs Bike Light"];

const checkRequirement = tool({
  description:
    "Returns the exact Sauce Demo product names that must be purchased.",
  inputSchema: z.object({}),
  execute: async () => ({
    requiredItems,
  }),
});

const instruction = `
Go to https://www.saucedemo.com/. Log in with the provided credentials, 
Call the check_requirement tool to determine the products to purchase, add the required products to the cart,
and complete checkout with the provided customer details.
`;

const output = z.object({
  confirmationMessage: z
    .string()
    .describe("The checkout confirmation message shown by Sauce Demo."),
  purchasedItems: z
    .array(z.string().describe("The purchased item name."))
    .describe("The purchased Sauce Demo item names."),
});

async function main(): Promise<void> {
  const userDataDir = createAutomationUserDataDir(
    "stagehand-sauce-demo-custom-tool-purchase-",
  );

  const stagehand = new Stagehand({
    env,
    experimental: true,
    model,
    verbose: 0,
    localBrowserLaunchOptions: {
      userDataDir,
      viewport: VIEWPORT,
    },
    // cacheDir: "runtime/cache/sauce_demo_agent_custom_tool_purchase",
  });

  try {
    await stagehand.init();

    const agent = stagehand.agent({
      mode: "hybrid",
      model,
      tools: {
        check_requirement: checkRequirement,
      },
      systemPrompt:
        "You are a careful browser automation assistant. Always call check_requirement before selecting products, then complete only the requested Sauce Demo checkout workflow.",
    });

    const result = await agent.execute({
      instruction,
      variables,
      output,
    });

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
