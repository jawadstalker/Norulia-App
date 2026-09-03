// import { Platform } from 'react-native';
// import * as IntentLauncher from 'expo-intent-launcher';

// export const NORU_PUZZLE_PACKAGE =
//   'com.IliyaPardazesh.NoruPuzzle';

// export async function launchNoruPuzzle(): Promise<boolean> {
//   if (Platform.OS !== 'android') {
//     return false;
//   }

//   try {
//     IntentLauncher.openApplication(
//       NORU_PUZZLE_PACKAGE
//     );

//     return true;
//   } catch (error) {
//     console.error(
//       'Failed to launch Noru Puzzle:',
//       error
//     );

//     return false;
//   }
// }