// Run with: npm exec -- tsx examples/playwright_integration.ts
//
// This example uses Playwright alongside Stagehand to record video
// because Stagehand does not support video recording in LOCAL mode.

import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import { Stagehand } from "@browserbasehq/stagehand";
import { chromium } from "playwright-core";
import {
  createAutomationUserDataDir,
  removeAutomationUserDataDir,
} from "../common/chromeAutomationProfile.js";
import { getStagehandEnv, getStagehandModel } from "../common/utils.js";

const SAUCE_DEMO_URL = "https://www.saucedemo.com/";
const variables = {
  username: "standard_user",
  password: "secret_sauce",
};

const env = getStagehandEnv();
const model = getStagehandModel();

// Launch Chrome with a temporary automation profile so startup prompts do not
// interrupt the run and both Stagehand and Playwright attach to the same
// predictable browser state.
const userDataDir = createAutomationUserDataDir(
  "stagehand-playwright-integration-",
);
const videoDir = path.resolve("runtime/videos/playwright_integration");

fs.mkdirSync(videoDir, { recursive: true });

const stagehand = new Stagehand({
  env,
  experimental: true,
  model,
  localBrowserLaunchOptions: {
    userDataDir,
  },
});

try {

  await stagehand.init();

  // Connect Playwright to the browser session that Stagehand started.
  // `chromium` is playwright's object for chromium based browsers.
  const browser = await chromium.connectOverCDP(stagehand.connectURL());
  
  // Create a fresh Playwright context with video recording enabled. Video
  // recording must be configured when the context is created, so we cannot use
  // the initial page that Stagehand created during init().
  const pwContext = await browser.newContext({
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  });
  const pwPage = await pwContext.newPage();

  // Close the initial page that Stagehand created during init() since we will use
  // the Playwright-owned page for the run.
  await stagehand.context.pages()[0]?.close();
  
  const agent = stagehand.agent({ mode: "hybrid" });

  // Stagehand handles the AI login flow on a Playwright-owned page.
  await pwPage.goto(SAUCE_DEMO_URL);
  await agent.execute({
    instruction: "Login to the website.",
    page: pwPage,
    variables,
  });

  // Playwright complements Stagehand here with a feature Stagehand does not
  // expose for LOCAL runs: saving a browser video.
  const title = await pwPage.title();
  const url = pwPage.url();
  const video = pwPage.video();

  await pwContext.close();

  console.log({
    message:
      "Stagehand handled the AI login flow. Playwright handled local video recording.",
    variables,
    title,
    url,
    videoDir,
    videoPath: video ? await video.path() : null,
  });

  await browser.close();
} finally {
  await stagehand.close();
  removeAutomationUserDataDir(userDataDir);
}
