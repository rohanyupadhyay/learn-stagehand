import "dotenv/config";

import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

const env = process.env.STAGEHAND_ENV === "BROWSERBASE" ? "BROWSERBASE" : "LOCAL";
const model = process.env.STAGEHAND_MODEL ?? "gpt-4.1-mini";

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
