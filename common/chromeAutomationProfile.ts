import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Creates a temporary Chrome user data directory for a single automation run.
 *
 * Stagehand passes this directory to Chrome as `userDataDir`, which makes the
 * browser use an isolated throwaway profile instead of the developer's normal
 * profile. The helper writes profile preferences before Chrome starts so local
 * examples avoid password-manager, breach-warning, notification, welcome-page,
 * and default-browser prompts that can block or change automation behavior.
 *
 * Chrome's breached-password warning is controlled by profile preferences in
 * some builds, so command-line flags alone are not always sufficient.
 *
 * @param prefix - Prefix used for the generated temporary profile directory.
 * @returns The temporary Chrome user data directory path to pass to Stagehand's
 * `localBrowserLaunchOptions.userDataDir`.
 */
export function createAutomationUserDataDir(
  prefix = "stagehand-profile-",
): string {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const defaultProfileDir = path.join(userDataDir, "Default");

  fs.mkdirSync(defaultProfileDir, { recursive: true });
  fs.writeFileSync(
    path.join(defaultProfileDir, "Preferences"),
    JSON.stringify(
      {
        autofill: {
          credit_card_enabled: false,
          profile_enabled: false,
        },
        browser: {
          check_default_browser: false,
          has_seen_welcome_page: true,
        },
        credentials_enable_autosignin: false,
        credentials_enable_service: false,
        profile: {
          default_content_setting_values: {
            notifications: 2,
          },
          password_manager_enabled: false,
          password_manager_leak_detection: false,
        },
        safebrowsing: {
          enabled: false,
          enhanced: false,
        },
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    path.join(userDataDir, "Local State"),
    JSON.stringify(
      {
        browser: {
          check_default_browser: false,
          enabled_labs_experiments: [],
        },
        safebrowsing: {
          enabled: false,
        },
        user_experience_metrics: {
          stability: {
            exited_cleanly: true,
          },
        },
      },
      null,
      2,
    ),
  );

  return userDataDir;
}

/**
 * Removes the throwaway Chrome profile created for an automation run.
 *
 * Call this after `stagehand.close()` so Chrome has released its profile files
 * before cleanup. Removing the directory keeps example runs stateless and avoids
 * accumulating temporary browser profiles on disk.
 *
 * @param userDataDir - Temporary Chrome user data directory path returned by
 * `createAutomationUserDataDir`.
 */
export function removeAutomationUserDataDir(userDataDir: string): void {
  fs.rmSync(userDataDir, { force: true, recursive: true });
}
