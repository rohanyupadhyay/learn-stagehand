const ADD_DELAY_FLAG = "--add-delay";
const ACTION_DELAY_MS = 1000;

/**
 * Sleeps briefly after an automation action when the example is run with
 * `--add-delay`.
 */
export async function delayAfterAction(): Promise<void> {
  if (!process.argv.includes(ADD_DELAY_FLAG)) {
    return;
  }

  await new Promise<void>((resolve) => {
    setTimeout(resolve, ACTION_DELAY_MS);
  });
}
