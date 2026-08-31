import AsyncStorage from '@react-native-async-storage/async-storage';

export type GameMetric = {
  id: string;
  label: string;
  value: number;
  unit?: string;
};

export type GameResult = {
  gameId: string;
  gameName: string;
  timestamp: number;
  score?: number;
  metrics: GameMetric[];
};

const STORAGE_KEY = 'norulia_game_results_v1';

export async function saveGameResult(
  result: GameResult
): Promise<void> {
  try {
    const stored =
      await AsyncStorage.getItem(STORAGE_KEY);

    let results: GameResult[] = [];

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          results = parsed;
        }
      } catch {
        results = [];
      }
    }

    results.push(result);

    /*
     * Keep the storage reasonably small.
     * We keep the latest 100 game sessions.
     */
    const limitedResults = results.slice(-100);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(limitedResults)
    );
  } catch (error) {
    console.warn(
      '[GameResults] Failed to save result:',
      error
    );
  }
}

export async function getGameResults(): Promise<
  GameResult[]
> {
  try {
    const stored =
      await AsyncStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.warn(
      '[GameResults] Failed to read results:',
      error
    );

    return [];
  }
}

export async function getLatestGameResult(): Promise<
  GameResult | null
> {
  const results = await getGameResults();

  if (!results.length) {
    return null;
  }

  return results[results.length - 1];
}

export async function clearGameResults(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn(
      '[GameResults] Failed to clear results:',
      error
    );
  }
}