// Run with: npm exec -- tsx examples/basic.ts

import "dotenv/config";

import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { getStagehandEnv, getStagehandModel } from "../common/utils.js";

const env = getStagehandEnv();
const model = getStagehandModel();

const stagehand = new Stagehand({
  env,
  model,
});

try {
  await stagehand.init();

  const page = stagehand.context.pages()[0];

  await page.goto("https://docs.stagehand.dev/");
  await stagehand.act("click the quickstart or getting started link");

  const pageInfo = await stagehand.extract(
    "Extract the page title and a one sentence summary of this page.",
    z.object({
      title: z.string(),
      summary: z.string(),
    }),
  );

  console.log(pageInfo);
} finally {
  await stagehand.close();
}
