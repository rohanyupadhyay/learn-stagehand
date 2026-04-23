// Run with: npm exec -- tsx examples/saucedemo_with_agent.ts

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

const VIEWPORT = { width: 1440, height: 960 };
const env = getStagehandEnv();
const model = getStagehandModel();


const instruction = `Go to https://www.saucedemo.com/ and purchase a backpack and a bike light.`;

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

const output = z.object({
  confirmationMessage: z
    .string()
    .describe("The checkout confirmation message shown by Sauce Demo."),
  purchasedItems: z
    .array(z.string())
    .describe("The item names visible in the checkout overview."),
});



async function main(): Promise<void> {
  const userDataDir = createAutomationUserDataDir(
    "stagehand-sauce-demo-profile-",
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
    cacheDir: "runtime/cache/saucedemo_with_agent",
    selfHeal: true,
  });

  await stagehand.init();

  const agent = stagehand.agent({
    mode: "hybrid",
    model: model,
    systemPrompt:
      "You are a careful browser automation assistant. Complete only the requested demo-site workflow and stop after the final confirmation page is reached.",
  });

  const result = await agent.execute({
    instruction,
    variables,
    output,
  });

  await stagehand.close();
  removeAutomationUserDataDir(userDataDir);


    console.log("Agent execution result:");
    console.log(JSON.stringify(result, null, 2));
  console.log("Structured output:");
  console.log(JSON.stringify(result.output, null, 2));

}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
