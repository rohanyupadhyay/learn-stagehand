import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Creates a temporary Chrome profile with password-manager and Safe Browsing
 * prompts disabled before Chrome starts.
 *
 * Chrome's breached-password warning is controlled by profile preferences in
 * some builds, so command-line flags alone are not always sufficient.
 *
 * @param prefix - Prefix used for the generated temporary profile directory.
 * @returns The temporary Chrome user data directory path.
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
 * Removes a temporary Chrome profile directory created for automation.
 *
 * @param userDataDir - Chrome user data directory path to remove.
 */
export function removeAutomationUserDataDir(userDataDir: string): void {
  fs.rmSync(userDataDir, { force: true, recursive: true });
}
