
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export type GameMetric = {
  key: string;
  value: number;
  unit?: string;

  /*
   * Optional normalized score from 0 to 100.
   * This is useful for the global results screen.
   */
  score?: number;
};

export type GameResult = {
  gameId: string;
  gameName: string;

  /*
   * Raw calculated metrics of the game.
   */
  metrics: Record<string, number>;

  /*
   * Human-readable metrics for UI.
   */
  metricItems?: GameMetric[];

  /*
   * Overall score of this game.
   */
  overallScore?: number;

  /*
   * Number of times this game has been completed.
   */
  sessions: number;

  /*
   * Last completion time.
   */
  updatedAt: number;

  /*
   * First completion time.
   */
  createdAt: number;
};

export type GameDatabase = {
  version: 1;

  /*
   * Every game is stored under its own gameId.
   */
  games: Record<string, GameResult>;

  /*
   * Global statistics.
   */
  totalGames: number;
  totalSessions: number;

  updatedAt: number;
};

/*
|--------------------------------------------------------------------------
| Context
|--------------------------------------------------------------------------
*/

type SaveGameResultInput = {
  gameId: string;
  gameName: string;

  metrics: Record<string, number>;

  metricItems?: GameMetric[];

  overallScore?: number;
};

type GameDataContextValue = {
  database: GameDatabase;

  games: GameResult[];

  loading: boolean;

  saveGameResult: (
    result: SaveGameResultInput
  ) => Promise<GameResult>;

  getGameResult: (
    gameId: string
  ) => GameResult | null;

  getMetric: (
    gameId: string,
    metricKey: string
  ) => number | null;

  clearGameResult: (
    gameId: string
  ) => Promise<void>;

  clearAllGameResults: () => Promise<void>;

  refreshGameData: () => Promise<void>;
};

const GameDataContext =
  createContext<GameDataContextValue | undefined>(
    undefined
  );

/*
|--------------------------------------------------------------------------
| Storage
|--------------------------------------------------------------------------
*/

const STORAGE_KEY =
  'norulia_user_game_database_v1';

/*
|--------------------------------------------------------------------------
| Empty database
|--------------------------------------------------------------------------
*/

const createEmptyDatabase =
  (): GameDatabase => ({
    version: 1,

    games: {},

    totalGames: 0,

    totalSessions: 0,

    updatedAt: Date.now(),
  });

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
*/

export function GameDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [database, setDatabase] =
    useState<GameDatabase>(
      createEmptyDatabase()
    );

  const [loading, setLoading] =
    useState(true);

  /*
   * --------------------------------------------------------------
   * Load database
   * --------------------------------------------------------------
   */

  const loadDatabase =
    useCallback(async () => {
      try {
        setLoading(true);

        const stored =
          await AsyncStorage.getItem(
            STORAGE_KEY
          );

        if (!stored) {
          const empty =
            createEmptyDatabase();

          setDatabase(empty);

          return;
        }

        const parsed =
          JSON.parse(stored);

        /*
         * Basic validation.
         */

        if (
          !parsed ||
          typeof parsed !==
            'object' ||
          !parsed.games ||
          typeof parsed.games !==
            'object'
        ) {
          const empty =
            createEmptyDatabase();

          setDatabase(empty);

          return;
        }

        const normalized: GameDatabase =
          {
            version: 1,

            games:
              parsed.games || {},

            totalGames:
              typeof parsed.totalGames ===
              'number'
                ? parsed.totalGames
                : Object.keys(
                    parsed.games || {}
                  ).length,

            totalSessions:
              typeof parsed.totalSessions ===
              'number'
                ? parsed.totalSessions
                : Object.values(
                    parsed.games || {}
                  ).reduce(
                    (
                      total: number,
                      game: any
                    ) =>
                      total +
                      (typeof game.sessions ===
                      'number'
                        ? game.sessions
                        : 0),
                    0
                  ),

            updatedAt:
              typeof parsed.updatedAt ===
              'number'
                ? parsed.updatedAt
                : Date.now(),
          };

        setDatabase(normalized);
      } catch (error) {
        console.warn(
          '[GameData] Failed to load database:',
          error
        );

        setDatabase(
          createEmptyDatabase()
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /*
   * Load once when Provider mounts.
   */

  useEffect(() => {
    loadDatabase();
  }, [loadDatabase]);

  /*
   * --------------------------------------------------------------
   * Persist database
   * --------------------------------------------------------------
   */

  const persistDatabase =
    useCallback(
      async (nextDatabase: GameDatabase) => {
        try {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
              nextDatabase
            )
          );
        } catch (error) {
          console.warn(
            '[GameData] Failed to save database:',
            error
          );
        }
      },
      []
    );

  /*
   * --------------------------------------------------------------
   * Save game result
   * --------------------------------------------------------------
   */

  const saveGameResult =
    useCallback(
      async (
        result: SaveGameResultInput
      ): Promise<GameResult> => {
        const now = Date.now();

        const previous =
          database.games[
            result.gameId
          ];

        /*
         * If this game already exists,
         * update it instead of creating
         * another game record.
         */

        const gameResult: GameResult =
          {
            gameId: result.gameId,

            gameName:
              result.gameName,

            metrics:
              result.metrics,

            metricItems:
              result.metricItems,

            overallScore:
              result.overallScore,

            sessions:
              previous
                ? previous.sessions + 1
                : 1,

            updatedAt: now,

            createdAt:
              previous?.createdAt ??
              now,
          };

        const nextGames = {
          ...database.games,

          [result.gameId]:
            gameResult,
        };

        const nextDatabase: GameDatabase =
          {
            version: 1,

            games: nextGames,

            totalGames:
              Object.keys(
                nextGames
              ).length,

            totalSessions:
              Object.values(
                nextGames
              ).reduce(
                (
                  total,
                  game
                ) =>
                  total +
                  game.sessions,
                0
              ),

            updatedAt: now,
          };

        /*
         * Update React immediately.
         */

        setDatabase(
          nextDatabase
        );

        /*
         * Persist to AsyncStorage.
         */

        await persistDatabase(
          nextDatabase
        );

        return gameResult;
      },
      [
        database,
        persistDatabase,
      ]
    );

  /*
   * --------------------------------------------------------------
   * Get one game
   * --------------------------------------------------------------
   */

  const getGameResult =
    useCallback(
      (gameId: string) => {
        return (
          database.games[
            gameId
          ] || null
        );
      },
      [database.games]
    );

  /*
   * --------------------------------------------------------------
   * Get one metric
   * --------------------------------------------------------------
   */

  const getMetric =
    useCallback(
      (
        gameId: string,
        metricKey: string
      ) => {
        const game =
          database.games[
            gameId
          ];

        if (!game) {
          return null;
        }

        const value =
          game.metrics[
            metricKey
          ];

        return typeof value ===
          'number'
          ? value
          : null;
      },
      [database.games]
    );

  /*
   * --------------------------------------------------------------
   * Delete one game
   * --------------------------------------------------------------
   */

  const clearGameResult =
    useCallback(
      async (gameId: string) => {
        const nextGames = {
          ...database.games,
        };

        delete nextGames[
          gameId
        ];

        const nextDatabase: GameDatabase =
          {
            version: 1,

            games: nextGames,

            totalGames:
              Object.keys(
                nextGames
              ).length,

            totalSessions:
              Object.values(
                nextGames
              ).reduce(
                (
                  total,
                  game
                ) =>
                  total +
                  game.sessions,
                0
              ),

            updatedAt:
              Date.now(),
          };

        setDatabase(
          nextDatabase
        );

        await persistDatabase(
          nextDatabase
        );
      },
      [
        database,
        persistDatabase,
      ]
    );

  /*
   * --------------------------------------------------------------
   * Delete everything
   * --------------------------------------------------------------
   */

  const clearAllGameResults =
    useCallback(async () => {
      const empty =
        createEmptyDatabase();

      setDatabase(empty);

      try {
        await AsyncStorage.removeItem(
          STORAGE_KEY
        );
      } catch (error) {
        console.warn(
          '[GameData] Failed to clear database:',
          error
        );
      }
    }, []);

  /*
   * --------------------------------------------------------------
   * Refresh
   * --------------------------------------------------------------
   */

  const refreshGameData =
    useCallback(async () => {
      await loadDatabase();
    }, [loadDatabase]);

  /*
   * --------------------------------------------------------------
   * Memoized game list
   * --------------------------------------------------------------
   */

  const games = useMemo(
    () =>
      Object.values(
        database.games
      ).sort(
        (a, b) =>
          b.updatedAt -
          a.updatedAt
      ),
    [database.games]
  );

  /*
   * --------------------------------------------------------------
   * Context value
   * --------------------------------------------------------------
   */

  const value =
    useMemo<GameDataContextValue>(
      () => ({
        database,

        games,

        loading,

        saveGameResult,

        getGameResult,

        getMetric,

        clearGameResult,

        clearAllGameResults,

        refreshGameData,
      }),
      [
        database,
        games,
        loading,
        saveGameResult,
        getGameResult,
        getMetric,
        clearGameResult,
        clearAllGameResults,
        refreshGameData,
      ]
    );

  return (
    <GameDataContext.Provider
      value={value}
    >
      {children}
    </GameDataContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| Hook
|--------------------------------------------------------------------------
*/

export function useGameData() {
  const context =
    useContext(
      GameDataContext
    );

  if (!context) {
    throw new Error(
      'useGameData must be used inside GameDataProvider'
    );
  }

  return context;
}
