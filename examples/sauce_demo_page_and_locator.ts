// Run with: npm exec -- tsx examples/sauce_demo_page_and_locator.ts
// Run with delay: npm exec -- tsx examples/sauce_demo_page_and_locator.ts --add-delay
//
// This example uses the Playwright page and locator APIs from a Stagehand
// browser session to log into Sauce Demo directly.

import "dotenv/config";

import { Stagehand } from "@browserbasehq/stagehand";
import { delayAfterAction } from "../common/delay.js";
import { getStagehandEnv, getStagehandModel } from "../common/utils.js";

const SAUCE_DEMO_URL = "https://www.saucedemo.com/";
const SAUCE_DEMO_USERNAME = "standard_user";
const SAUCE_DEMO_PASSWORD = "secret_sauce";

// Read the shared Stagehand configuration for this example from `.env`.
const env = getStagehandEnv();
const model = getStagehandModel();

// Create one Stagehand client.
const stagehand = new Stagehand({
  env, // LOCAL or BROWSERBASE
  model, // e.g. "google/gemini-2.5-pro", "openai/gpt-4o", etc.
});

try {
  
  // Initialize the browser session. It creates a browser context and opens a new tab.
  await stagehand.init();

  // Get the browser tab on which we will operate.
  const page = stagehand.context.pages()[0];

  // Navigate to the Sauce Demo login page.
  await page.goto(SAUCE_DEMO_URL);
  await delayAfterAction();

  // Wait until the page fully loads before interacting with the login form.
  await page.waitForLoadState("load", 15000);
  await delayAfterAction();

  // Use the page object directly, find elements with xpath and interact with them.
  await page.locator('input[data-test="username"]').fill(SAUCE_DEMO_USERNAME);
  await delayAfterAction();
  await page.locator('input[data-test="password"]').fill(SAUCE_DEMO_PASSWORD);
  await delayAfterAction();
  await page.locator('input[data-test="login-button"]').click();
  await delayAfterAction();

  const title = await page.title();
  await delayAfterAction();
  const url = page.url();
  await delayAfterAction();

  console.log({
    title,
    url,
    loggedIn: url.includes("/inventory.html"),
  });
} finally {
  // Always close the browser session, even if the example throws.
  await stagehand.close();
}
