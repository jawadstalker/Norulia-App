import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

// Real Android applicationIdentifier from the game's Unity
// project (ProjectSettings/ProjectSettings.asset -> productName:
// NEUROLIA). The previous value, "com.IliyaPardazesh.NoruPuzzle",
// did not match any installed app, which is why launching it
// always failed.
export const NORU_PUZZLE_PACKAGE =
  'com.IliyaPardazesh.NEUROLIA';

// Lost Island currently launches the same external app as
// Forest Adventure / Noru Puzzle. If it ever gets its own APK,
// just point this at the new package name.
export const LOST_ISLAND_PACKAGE = NORU_PUZZLE_PACKAGE;

/**
 * Attempts to open an installed Android app by package name.
 * Returns true only if the intent was actually dispatched
 * without throwing (app installed + visible to this app).
 */
export async function launchExternalApp(
  packageName: string
): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    IntentLauncher.openApplication(packageName);

    return true;
  } catch (error) {
    console.error(
      `Failed to launch external app (${packageName}):`,
      error
    );

    return false;
  }
}

export async function launchNoruPuzzle(): Promise<boolean> {
  return launchExternalApp(NORU_PUZZLE_PACKAGE);
}

export async function launchLostIsland(): Promise<boolean> {
  return launchExternalApp(LOST_ISLAND_PACKAGE);
}