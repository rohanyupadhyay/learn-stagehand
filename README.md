# Learn Stagehand

TypeScript examples for learning how to use [Stagehand](https://docs.stagehand.dev/).

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set `STAGEHAND_ENV=LOCAL` for local browser runs, or `STAGEHAND_ENV=BROWSERBASE` when using Browserbase. Add the matching API keys in `.env`.

## Running Examples

Example files live in `examples/` and are run directly with `tsx`:

```bash
npm exec -- tsx examples/basic.ts
```

Use the same pattern for new scripts:

```bash
npm exec -- tsx examples/<script-name>.ts
```

## Examples

The `example/` directory contains all the stagehand examples.

## Adding More Examples

Add TypeScript files under `examples/`. Keep scripts self-contained so each one can be run independently with `npm exec -- tsx ...`.
At the top of each example file, add a comment showing the exact command used to run that file.
Write runtime artifacts such as Stagehand cache data under `runtime/`. For example, `examples/saucedemo_with_agent.ts` uses `runtime/cache/saucedemo_with_agent`.
