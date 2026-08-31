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

/* ================================================================
   TYPES
================================================================ */

export type GameMetric = {
  key: string;
  value: number;
  unit?: string;
  score?: number;
};

export type GameResult = {
  gameId: string;
  gameName: string;

  metrics: Record<string, number>;

  metricItems?: GameMetric[];

  overallScore?: number;

  sessions: number;

  updatedAt: number;

  createdAt: number;
};

export type GameDatabase = {
  version: 1;

  userId: string;

  games: Record<string, GameResult>;

  totalGames: number;

  totalSessions: number;

  updatedAt: number;
};

/* ================================================================
   INPUT
================================================================ */

type SaveGameResultInput = {
  gameId: string;
  gameName: string;

  metrics: Record<string, number>;

  metricItems?: GameMetric[];

  overallScore?: number;
};

/* ================================================================
   CONTEXT TYPE
================================================================ */

type GameDataContextValue = {
  database: GameDatabase;

  games: GameResult[];

  loading: boolean;

  userId: string | null;

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

  setGameUser: (
    nextUserId: string | null
  ) => Promise<void>;
};

/* ================================================================
   CONTEXT
================================================================ */

const GameDataContext =
  createContext<
    GameDataContextValue | undefined
  >(undefined);

/* ================================================================
   STORAGE KEYS
================================================================ */

/*
 * آخرین کاربری که GameDataContext با آن کار کرده است.
 */
const ACTIVE_USER_KEY =
  '@norulia_active_game_user';

/*
 * Prefix دیتابیس بازی‌ها.
 *
 * نتیجه نهایی:
 *
 * @norulia_game_database_user123
 *
 * @norulia_game_database_user456
 */
const STORAGE_PREFIX =
  '@norulia_game_database_';

/* ================================================================
   EMPTY DATABASE
================================================================ */

const createEmptyDatabase = (
  userId: string
): GameDatabase => ({
  version: 1,

  userId,

  games: {},

  totalGames: 0,

  totalSessions: 0,

  updatedAt: Date.now(),
});

/* ================================================================
   STORAGE KEY
================================================================ */

const getStorageKey = (
  userId: string
) => {
  /*
   * User ID را برای کلید Storage
   * کمی sanitize می‌کنیم تا کاراکتر
   * نامناسب وارد کلید نشود.
   */

  const safeUserId =
    String(userId)
      .trim()
      .replace(
        /[^a-zA-Z0-9_.:@-]/g,
        '_'
      );

  return `${STORAGE_PREFIX}${safeUserId}`;
};

/* ================================================================
   NORMALIZE DATABASE
================================================================ */

const normalizeDatabase = (
  parsed: any,
  userId: string
): GameDatabase => {
  if (
    !parsed ||
    typeof parsed !== 'object'
  ) {
    return createEmptyDatabase(
      userId
    );
  }

  const games =
    parsed.games &&
    typeof parsed.games ===
      'object'
      ? parsed.games
      : {};

  const totalGames =
    Object.keys(games).length;

  const totalSessions =
    Object.values(games).reduce(
      (
        total: number,
        game: any
      ) =>
        total +
        (typeof game?.sessions ===
        'number'
          ? game.sessions
          : 0),
      0
    );

  return {
    version: 1,

    userId,

    games,

    totalGames,

    totalSessions,

    updatedAt:
      typeof parsed.updatedAt ===
      'number'
        ? parsed.updatedAt
        : Date.now(),
  };
};

/* ================================================================
   PROVIDER
================================================================ */

export function GameDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  /*
   * --------------------------------------------------------------
   * Current user
   * --------------------------------------------------------------
   */

  const [userId, setUserId] =
    useState<string | null>(null);

  /*
   * --------------------------------------------------------------
   * Database
   * --------------------------------------------------------------
   */

  const [
    database,
    setDatabase,
  ] = useState<GameDatabase>(
    createEmptyDatabase('anonymous')
  );

  /*
   * --------------------------------------------------------------
   * Loading
   * --------------------------------------------------------------
   */

  const [loading, setLoading] =
    useState(true);

  /* ==============================================================
     LOAD USER ID
  ============================================================== */

  const loadActiveUser =
    useCallback(async () => {
      try {
        const savedUserId =
          await AsyncStorage.getItem(
            ACTIVE_USER_KEY
          );

        if (
          savedUserId &&
          savedUserId.trim()
        ) {
          setUserId(
            savedUserId
          );

          return savedUserId;
        }

        /*
         * هنوز User ID مشخص نیست.
         */

        setUserId(null);

        return null;
      } catch (error) {
        console.warn(
          '[GameData] Failed to load active user:',
          error
        );

        setUserId(null);

        return null;
      }
    }, []);

  /* ==============================================================
     LOAD USER DATABASE
  ============================================================== */

  const loadDatabaseForUser =
    useCallback(
      async (
        targetUserId: string
      ) => {
        try {
          setLoading(true);

          const storageKey =
            getStorageKey(
              targetUserId
            );

          const stored =
            await AsyncStorage.getItem(
              storageKey
            );

          if (!stored) {
            setDatabase(
              createEmptyDatabase(
                targetUserId
              )
            );

            return;
          }

          let parsed: any;

          try {
            parsed =
              JSON.parse(stored);
          } catch {
            parsed = null;
          }

          const normalized =
            normalizeDatabase(
              parsed,
              targetUserId
            );

          setDatabase(
            normalized
          );
        } catch (error) {
          console.warn(
            '[GameData] Failed to load user database:',
            error
          );

          setDatabase(
            createEmptyDatabase(
              targetUserId
            )
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  /* ==============================================================
     INITIAL LOAD
  ============================================================== */

  useEffect(() => {
    let mounted = true;

    const initialize =
      async () => {
        const activeUser =
          await loadActiveUser();

        if (
          !mounted
        ) {
          return;
        }

        if (
          activeUser
        ) {
          await loadDatabaseForUser(
            activeUser
          );
        } else {
          setLoading(false);
        }
      };

    void initialize();

    return () => {
      mounted = false;
    };
  }, [
    loadActiveUser,
    loadDatabaseForUser,
  ]);

  /* ==============================================================
     SET GAME USER
  ============================================================== */

  const setGameUser =
    useCallback(
      async (
        nextUserId: string | null
      ) => {
        /*
         * Logout / no user.
         */

        if (
          !nextUserId ||
          !nextUserId.trim()
        ) {
          setUserId(null);

          setDatabase(
            createEmptyDatabase(
              'anonymous'
            )
          );

          setLoading(false);

          await AsyncStorage.removeItem(
            ACTIVE_USER_KEY
          );

          return;
        }

        const normalizedUserId =
          String(
            nextUserId
          ).trim();

        /*
         * Save active user.
         */

        await AsyncStorage.setItem(
          ACTIVE_USER_KEY,
          normalizedUserId
        );

        /*
         * Update context.
         */

        setUserId(
          normalizedUserId
        );

        /*
         * Load THIS user's
         * game database.
         */

        await loadDatabaseForUser(
          normalizedUserId
        );
      },
      [
        loadDatabaseForUser,
      ]
    );

  /* ==============================================================
     PERSIST DATABASE
  ============================================================== */

  const persistDatabase =
    useCallback(
      async (
        nextDatabase: GameDatabase
      ) => {
        if (
          !nextDatabase.userId ||
          nextDatabase.userId ===
            'anonymous'
        ) {
          return;
        }

        try {
          const storageKey =
            getStorageKey(
              nextDatabase.userId
            );

          await AsyncStorage.setItem(
            storageKey,
            JSON.stringify(
              nextDatabase
            )
          );
        } catch (error) {
          console.warn(
            '[GameData] Failed to persist database:',
            error
          );

          throw error;
        }
      },
      []
    );

  /* ==============================================================
     SAVE GAME RESULT
  ============================================================== */

  const saveGameResult =
    useCallback(
      async (
        result: SaveGameResultInput
      ): Promise<GameResult> => {
        /*
         * بدون User ID اجازه ذخیره
         * اطلاعات بازی را نمی‌دهیم.
         */

        if (
          !userId
        ) {
          throw new Error(
            'Cannot save game result: no active user.'
          );
        }

        const now =
          Date.now();

        const previous =
          database.games[
            result.gameId
          ];

        /*
         * یک session جدید برای
         * همین بازی ثبت می‌کنیم.
         */

        const gameResult:
          GameResult = {
            gameId:
              result.gameId,

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
                ? previous.sessions +
                  1
                : 1,

            updatedAt:
              now,

            createdAt:
              previous?.createdAt ??
              now,
          };

        const nextGames = {
          ...database.games,

          [result.gameId]:
            gameResult,
        };

        const nextDatabase:
          GameDatabase = {
            version: 1,

            userId,

            games:
              nextGames,

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
              now,
          };

        /*
         * UI immediately updates.
         */

        setDatabase(
          nextDatabase
        );

        /*
         * Save permanently.
         */

        await persistDatabase(
          nextDatabase
        );

        return gameResult;
      },
      [
        userId,
        database,
        persistDatabase,
      ]
    );

  /* ==============================================================
     GET GAME RESULT
  ============================================================== */

  const getGameResult =
    useCallback(
      (
        gameId: string
      ) => {
        return (
          database.games[
            gameId
          ] ?? null
        );
      },
      [
        database.games,
      ]
    );

  /* ==============================================================
     GET METRIC
  ============================================================== */

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
      [
        database.games,
      ]
    );

  /* ==============================================================
     CLEAR ONE GAME
  ============================================================== */

  const clearGameResult =
    useCallback(
      async (
        gameId: string
      ) => {
        if (!userId) {
          return;
        }

        const nextGames = {
          ...database.games,
        };

        delete nextGames[
          gameId
        ];

        const nextDatabase:
          GameDatabase = {
            version: 1,

            userId,

            games:
              nextGames,

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
        userId,
        database,
        persistDatabase,
      ]
    );

  /* ==============================================================
     CLEAR ALL
  ============================================================== */

  const clearAllGameResults =
    useCallback(
      async () => {
        if (!userId) {
          return;
        }

        const empty =
          createEmptyDatabase(
            userId
          );

        setDatabase(
          empty
        );

        try {
          await AsyncStorage.removeItem(
            getStorageKey(
              userId
            )
          );
        } catch (error) {
          console.warn(
            '[GameData] Failed to clear database:',
            error
          );
        }
      },
      [userId]
    );

  /* ==============================================================
     REFRESH
  ============================================================== */

  const refreshGameData =
    useCallback(
      async () => {
        if (!userId) {
          return;
        }

        await loadDatabaseForUser(
          userId
        );
      },
      [
        userId,
        loadDatabaseForUser,
      ]
    );

  /* ==============================================================
     GAMES ARRAY
  ============================================================== */

  const games =
    useMemo(
      () =>
        Object.values(
          database.games
        ).sort(
          (a, b) =>
            b.updatedAt -
            a.updatedAt
        ),
      [
        database.games,
      ]
    );

  /* ==============================================================
     CONTEXT VALUE
  ============================================================== */

  const value =
    useMemo<GameDataContextValue>(
      () => ({
        database,

        games,

        loading,

        userId,

        saveGameResult,

        getGameResult,

        getMetric,

        clearGameResult,

        clearAllGameResults,

        refreshGameData,

        setGameUser,
      }),
      [
        database,
        games,
        loading,
        userId,
        saveGameResult,
        getGameResult,
        getMetric,
        clearGameResult,
        clearAllGameResults,
        refreshGameData,
        setGameUser,
      ]
    );

  /* ==============================================================
     PROVIDER
  ============================================================== */

  return (
    <GameDataContext.Provider
      value={value}
    >
      {children}
    </GameDataContext.Provider>
  );
}

/* ================================================================
   HOOK
================================================================ */

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