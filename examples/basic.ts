// Run with: npm exec -- tsx examples/basic.ts

import "dotenv/config";

import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { getStagehandEnv, getStagehandModel } from "../common/utils.js";

// Read the shared Stagehand configuration for this example from `.env`.
const env = getStagehandEnv();
const model = getStagehandModel();

// Create one Stagehand client for the whole script.
const stagehand = new Stagehand({
  env,
  model,
});

try {
  await stagehand.init();

  // Stagehand exposes Playwright pages through the browser context.
  const page = stagehand.context.pages()[0];

  await page.goto("https://docs.stagehand.dev/");
  await stagehand.act("click the quickstart or getting started link");

  // Use a schema so the extracted result has a stable tutorial-friendly shape.
  const pageInfo = await stagehand.extract(
    "Extract the page title and a one sentence summary of this page.",
    z.object({
      title: z.string(),
      summary: z.string(),
    }),
  );

  console.log(pageInfo);
} finally {
  // Always close the browser session, even if the example throws.
  await stagehand.close();
}
