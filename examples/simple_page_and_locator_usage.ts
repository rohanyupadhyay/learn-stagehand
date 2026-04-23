// Run with: npm exec -- tsx examples/simple_page_and_locator_usage.ts

import "dotenv/config";

import { Stagehand } from "@browserbasehq/stagehand";
import { getStagehandEnv, getStagehandModel } from "../common/utils.js";

const SAUCE_DEMO_URL = "https://www.saucedemo.com/";
const SAUCE_DEMO_USERNAME = "standard_user";
const SAUCE_DEMO_PASSWORD = "secret_sauce";

// Read the shared Stagehand configuration for this example from `.env`.
const env = getStagehandEnv();
const model = getStagehandModel();

// Create one Stagehand client for the whole script.
const stagehand = new Stagehand({
  env,
  model,
});

try {
  
  // Initialize the browser session. It creates a browser context and opens a new tab.
  await stagehand.init();

  // Get the browser tab on which we will operate.
  const page = stagehand.context.pages()[0];

  // Navigate to the Sauce Demo login page.
  await page.goto(SAUCE_DEMO_URL);

  // Wait until the page fully loads before interacting with the login form.
  await page.waitForLoadState("load", 15000);

  // Use the page object directly, find elements with xpath and interact with them.
  await page.locator('input[data-test="username"]').fill(SAUCE_DEMO_USERNAME);
  await page.locator('input[data-test="password"]').fill(SAUCE_DEMO_PASSWORD);
  await page.locator('input[data-test="login-button"]').click();

  const title = await page.title();
  const url = page.url();

  console.log({
    title,
    url,
    loggedIn: url.includes("/inventory.html"),
  });
} finally {
  // Always close the browser session, even if the example throws.
  await stagehand.close();
}
