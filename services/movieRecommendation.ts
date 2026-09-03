import { GameResult } from '../app/games/gameResults';

/**
 * ============================================================================
 * NORULIA MOVIE RECOMMENDATION SERVICE
 * ============================================================================
 *
 * Backend:
 * Google Colab + FastAPI + ngrok
 *
 * Current API:
 *
 * GET  /health
 * POST /recommend
 *
 * Authentication:
 * X-API-Key
 *
 * Current response format (bilingual):
 *
 * {
 *   "success": true,
 *   "recommendations": [
 *     {
 *       "movie_id": 497,
 *       "title_en": "The Green Mile",
 *       "title_fa": "مسیر سبز",
 *       "overview_en": "...",
 *       "overview_fa": "...",
 *       "genres_en": ["Drama", "Fantasy"],
 *       "genres_fa": ["درام", "فانتزی"],
 *       "reason_en": "Recommended because...",
 *       "reason_fa": "توصیه می‌شود زیرا...",
 *       "similarity": 0.3667,
 *       "matched_tags": ["emotional", "thoughtful"]
 *     }
 *   ],
 *   "profile": {
 *     "games_analyzed": 11,
 *     "dimensions": {...},
 *     "raw_metrics": {...},
 *     "traits": [...],
 *     "preferences": [...]
 *   },
 *   "games_analyzed": 11,
 *   "top_k": 3
 * }
 *
 * ============================================================================
 */

/**
 * ============================================================================
 * API CONFIGURATION
 * ============================================================================
 *
 * IMPORTANT:
 *
 * Do not commit a real production API key to GitHub.
 *
 * For development you can temporarily place the current key here.
 *
 * Replace the placeholder below with your CURRENT Colab API key.
 */
const MOVIE_API_URL =
  'https://roundness-stuck-stretch.ngrok-free.dev';

const MOVIE_API_KEY =
  '3IhN7vwOx7PIS5SxD5zBzezSVih_Yb6aBheAMq9ypaQKPB3G';

const AUTH_HEADER_NAME =
  'X-API-Key';

export const MINIMUM_GAMES = 3;

export const DEFAULT_TOP_K = 3;

export const MAX_TOP_K = 10;

/**
 * Request timeout.
 *
 * This prevents the app from waiting forever if:
 *
 * - Colab is asleep
 * - ngrok is disconnected
 * - FastAPI is unavailable
 * - recommendation engine hangs
 */
const REQUEST_TIMEOUT_MS = 45000;


/**
 * ============================================================================
 * MOVIE RECOMMENDATION (BILINGUAL)
 * ============================================================================
 */

export type MovieRecommendation = {
  movieId: number;

  // English
  titleEn: string;
  overviewEn: string;
  genresEn: string[];
  reasonEn: string;

  // Persian
  titleFa: string;
  overviewFa: string;
  genresFa: string[];
  reasonFa: string;

  // Current language (based on language param)
  title: string;
  overview: string;
  genres: string[];
  reason: string;

  similarity: number;
  matchedTags: string[];
};


/**
 * ============================================================================
 * COGNITIVE PROFILE
 * ============================================================================
 */

export type MovieRecommendationDimensions = {
  processing_speed: number;
  attention: number;
  memory: number;
  motor_accuracy: number;
  resilience: number;
  reasoning: number;
};

export type MovieRecommendationProfile = {
  gamesAnalyzed: number;

  dimensions: MovieRecommendationDimensions;

  rawMetrics: Record<string, number>;

  traits: string[];

  preferences: string[];
};


/**
 * ============================================================================
 * COMPLETE API RESULT
 * ============================================================================
 */

export type MovieRecommendationResponse = {
  success: boolean;

  recommendations: MovieRecommendation[];

  profile: MovieRecommendationProfile | null;

  gamesAnalyzed: number;

  topK: number;

  message?: string;
};


/**
 * ============================================================================
 * API REQUEST
 * ============================================================================
 */

type MovieRecommendationRequest = {
  games: GameResult[];
  top_k: number;
  language: 'fa' | 'en';
};


/**
 * ============================================================================
 * RAW API MOVIE (BILINGUAL)
 * ============================================================================
 */

type RawMovieRecommendation = {
  movie_id?: number | string;

  // Old / compatibility
  title?: string;
  overview?: string;
  genres?: string[] | string;
  reason?: string;

  // English
  title_en?: string;
  overview_en?: string;
  genres_en?: string[] | string;
  reason_en?: string;

  // Persian
  title_fa?: string;
  overview_fa?: string;
  genres_fa?: string[] | string;
  reason_fa?: string;

  similarity?: number | string;

  matched_tags?: string[];
};


/**
 * ============================================================================
 * RAW API PROFILE
 * ============================================================================
 */

type RawMovieRecommendationProfile = {
  games_analyzed?: number | string;

  dimensions?: {
    processing_speed?: number | string;
    attention?: number | string;
    memory?: number | string;
    motor_accuracy?: number | string;
    resilience?: number | string;
    reasoning?: number | string;
  };

  raw_metrics?: Record<string, number | string>;

  traits?: string[];

  preferences?: string[];
};


/**
 * ============================================================================
 * RAW API RESPONSE
 * ============================================================================
 */

type RawMovieRecommendationResponse = {
  success?: boolean;

  recommendations?: RawMovieRecommendation[];

  profile?: RawMovieRecommendationProfile | null;

  games_analyzed?: number | string;

  top_k?: number | string;

  message?: string;

  detail?: string;
};


/**
 * ============================================================================
 * TOP K NORMALIZATION
 * ============================================================================
 */

function normalizeTopK(
  value: number = DEFAULT_TOP_K
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_TOP_K;
  }

  return Math.max(
    1,
    Math.min(
      MAX_TOP_K,
      Math.floor(parsed)
    )
  );
}


/**
 * ============================================================================
 * NUMBER NORMALIZATION
 * ============================================================================
 */

function safeNumber(
  value: unknown,
  fallback = 0
): number {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}


/**
 * ============================================================================
 * NORMALIZE MOVIE (BILINGUAL)
 * ============================================================================
 */

function normalizeMovie(
  movie: RawMovieRecommendation,
  language: 'fa' | 'en'
): MovieRecommendation | null {
  if (
    !movie ||
    typeof movie !== 'object'
  ) {
    return null;
  }

  const movieId = safeNumber(
    movie.movie_id,
    0
  );

  // ==========================================================
  // ENGLISH
  // ==========================================================

  const titleEn =
    typeof movie.title_en === 'string'
      ? movie.title_en.trim()
      : typeof movie.title === 'string'
        ? movie.title.trim()
        : '';

  const overviewEn =
    typeof movie.overview_en === 'string'
      ? movie.overview_en.trim()
      : typeof movie.overview === 'string'
        ? movie.overview.trim()
        : '';

  const reasonEn =
    typeof movie.reason_en === 'string'
      ? movie.reason_en.trim()
      : typeof movie.reason === 'string'
        ? movie.reason.trim()
        : '';

  // ==========================================================
  // PERSIAN
  // ==========================================================

  const titleFa =
    typeof movie.title_fa === 'string'
      ? movie.title_fa.trim()
      : titleEn;

  const overviewFa =
    typeof movie.overview_fa === 'string'
      ? movie.overview_fa.trim()
      : overviewEn;

  const reasonFa =
    typeof movie.reason_fa === 'string'
      ? movie.reason_fa.trim()
      : reasonEn;

  // ==========================================================
  // ENGLISH GENRES
  // ==========================================================

  let genresEn: string[] = [];

  const rawGenresEn =
    movie.genres_en ??
    movie.genres ??
    [];

  if (
    Array.isArray(rawGenresEn)
  ) {
    genresEn = rawGenresEn
      .filter(
        (
          genre
        ): genre is string =>
          typeof genre === 'string'
      )
      .map(
        genre => genre.trim()
      )
      .filter(Boolean);
  } else if (
    typeof rawGenresEn === 'string'
  ) {
    genresEn = rawGenresEn
      .split(',')
      .map(
        genre => genre.trim()
      )
      .filter(Boolean);
  }

  // ==========================================================
  // PERSIAN GENRES
  // ==========================================================

  let genresFa: string[] = [];

  const rawGenresFa =
    movie.genres_fa ??
    [];

  if (
    Array.isArray(rawGenresFa)
  ) {
    genresFa = rawGenresFa
      .filter(
        (
          genre
        ): genre is string =>
          typeof genre === 'string'
      )
      .map(
        genre => genre.trim()
      )
      .filter(Boolean);
  } else if (
    typeof rawGenresFa === 'string'
  ) {
    genresFa = rawGenresFa
      .split(',')
      .map(
        genre => genre.trim()
      )
      .filter(Boolean);
  }

  // ==========================================================
  // FALLBACK
  // ==========================================================

  if (
    genresFa.length === 0 &&
    genresEn.length > 0
  ) {
    genresFa = genresEn;
  }

  if (!titleEn && !titleFa) {
    return null;
  }

  // ==========================================================
  // CURRENT LANGUAGE
  // ==========================================================

  const isPersian =
    language === 'fa';

  const title =
    isPersian
      ? titleFa
      : titleEn;

  const overview =
    isPersian
      ? overviewFa
      : overviewEn;

  const genres =
    isPersian
      ? genresFa
      : genresEn;

  const reason =
    isPersian
      ? reasonFa
      : reasonEn;

  // ==========================================================
  // MATCHED TAGS
  // ==========================================================

  const matchedTags =
    Array.isArray(
      movie.matched_tags
    )
      ? movie.matched_tags
          .filter(
            (
              tag
            ): tag is string =>
              typeof tag === 'string'
          )
          .map(
            tag => tag.trim()
          )
          .filter(Boolean)
      : [];

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    movieId,

    titleEn,
    overviewEn,
    genresEn,
    reasonEn,

    titleFa,
    overviewFa,
    genresFa,
    reasonFa,

    title,
    overview,
    genres,
    reason,

    similarity:
      safeNumber(
        movie.similarity,
        0
      ),

    matchedTags,
  };
}


/**
 * ============================================================================
 * NORMALIZE PROFILE
 * ============================================================================
 */

function normalizeProfile(
  profile?: RawMovieRecommendationProfile | null
): MovieRecommendationProfile | null {
  if (
    !profile ||
    typeof profile !== 'object'
  ) {
    return null;
  }

  const dimensions =
    profile.dimensions ?? {};

  const rawMetrics: Record<
    string,
    number
  > = {};

  if (
    profile.raw_metrics &&
    typeof profile.raw_metrics === 'object'
  ) {
    Object.entries(
      profile.raw_metrics
    ).forEach(
      ([key, value]) => {
        const numericValue =
          Number(value);

        if (
          Number.isFinite(
            numericValue
          )
        ) {
          rawMetrics[key] =
            numericValue;
        }
      }
    );
  }

  const traits =
    Array.isArray(
      profile.traits
    )
      ? profile.traits
          .filter(
            item =>
              typeof item === 'string'
          )
          .map(
            item => item.trim()
          )
          .filter(Boolean)
      : [];

  const preferences =
    Array.isArray(
      profile.preferences
    )
      ? profile.preferences
          .filter(
            item =>
              typeof item === 'string'
          )
          .map(
            item => item.trim()
          )
          .filter(Boolean)
      : [];

  return {
    gamesAnalyzed:
      safeNumber(
        profile.games_analyzed,
        0
      ),

    dimensions: {
      processing_speed:
        safeNumber(
          dimensions.processing_speed,
          0
        ),

      attention:
        safeNumber(
          dimensions.attention,
          0
        ),

      memory:
        safeNumber(
          dimensions.memory,
          0
        ),

      motor_accuracy:
        safeNumber(
          dimensions.motor_accuracy,
          0
        ),

      resilience:
        safeNumber(
          dimensions.resilience,
          0
        ),

      reasoning:
        safeNumber(
          dimensions.reasoning,
          0
        ),
    },

    rawMetrics,

    traits,

    preferences,
  };
}


/**
 * ============================================================================
 * VALIDATE GAMES
 * ============================================================================
 */

function validateGames(
  games: GameResult[]
): void {
  if (
    !Array.isArray(games)
  ) {
    throw new Error(
      'Invalid game results provided for movie recommendation.'
    );
  }

  if (
    games.length < MINIMUM_GAMES
  ) {
    throw new Error(
      `At least ${MINIMUM_GAMES} game sessions are required before movie recommendations can be generated.`
    );
  }
}


/**
 * ============================================================================
 * BUILD REQUEST
 * ============================================================================
 */

function buildRequest(
  games: GameResult[],
  topK: number,
  language: 'fa' | 'en'
): MovieRecommendationRequest {
  return {
    games,
    top_k: normalizeTopK(topK),
    language,
  };
}


/**
 * ============================================================================
 * FETCH MOVIE API
 * ============================================================================
 *
 * This is the ONLY function that actually communicates with Colab.
 *
 * Keeping the network logic here prevents duplicate implementation
 * between getMovieRecommendations() and getMovieRecommendationResult().
 * ============================================================================
 */

async function requestMovieAPI(
  games: GameResult[],
  topK: number,
  language: 'fa' | 'en'
): Promise<RawMovieRecommendationResponse> {
  validateGames(games);

  const safeTopK =
    normalizeTopK(topK);

  const payload =
    buildRequest(
      games,
      safeTopK,
      language
    );

  const endpoint =
    `${MOVIE_API_URL.replace(/\/+$/, '')}/recommend`;

  console.log(
    '[MovieRecommendation] Request:',
    {
      endpoint,
      games: games.length,
      topK: safeTopK,
      language,
    }
  );

  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(
      () => {
        controller.abort();
      },
      REQUEST_TIMEOUT_MS
    );

  let response: Response;

  try {
    response =
      await fetch(
        endpoint,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json',

            [AUTH_HEADER_NAME]:
              MOVIE_API_KEY,
          },

          body:
            JSON.stringify(
              payload
            ),

          signal:
            controller.signal,
        }
      );
  } catch (error) {
    clearTimeout(timeoutId);

    console.error(
      '[MovieRecommendation] Network error:',
      error
    );

    if (
      error instanceof Error &&
      error.name === 'AbortError'
    ) {
      throw new Error(
        'Movie recommendation service timed out. Make sure the Colab runtime is still running.'
      );
    }

    throw new Error(
      'Could not connect to the Norulia movie recommendation service. Make sure Colab and ngrok are running.'
    );
  }

  clearTimeout(timeoutId);

  /**
   * Read body exactly once.
   */
  const responseText =
    await response.text();

  let data:
    RawMovieRecommendationResponse |
    null = null;

  if (
    responseText.trim()
  ) {
    try {
      data =
        JSON.parse(
          responseText
        );
    } catch (error) {
      console.error(
        '[MovieRecommendation] Invalid JSON:',
        error
      );

      throw new Error(
        'The movie recommendation service returned an invalid response.'
      );
    }
  }

  /**
   * ==========================================================================
   * HTTP ERROR
   * ==========================================================================
   */

  if (!response.ok) {
    const errorMessage =
      typeof data?.detail === 'string'
        ? data.detail
        : typeof data?.message === 'string'
          ? data.message
          : `Movie recommendation API failed (${response.status})`;

    console.error(
      '[MovieRecommendation] API error:',
      {
        status:
          response.status,

        message:
          errorMessage,

        body:
          responseText,
      }
    );

    if (
      response.status === 401
    ) {
      throw new Error(
        'Movie recommendation authentication failed. Check the X-API-Key used by the app and Colab.'
      );
    }

    if (
      response.status === 400
    ) {
      throw new Error(
        errorMessage
      );
    }

    if (
      response.status === 404
    ) {
      throw new Error(
        'Movie recommendation endpoint was not found. Make sure the current Colab/ngrok server is running.'
      );
    }

    if (
      response.status >= 500
    ) {
      throw new Error(
        'The movie recommendation server encountered an internal error. Check the Colab output.'
      );
    }

    throw new Error(
      errorMessage
    );
  }

  /**
   * ==========================================================================
   * EMPTY RESPONSE
   * ==========================================================================
   */

  if (!data) {
    throw new Error(
      'Movie recommendation API returned an empty response.'
    );
  }

  /**
   * ==========================================================================
   * API SUCCESS FLAG
   * ==========================================================================
   */

  if (
    data.success === false
  ) {
    throw new Error(
      data.message ||
        'Movie recommendation service failed.'
    );
  }

  return data;
}


/**
 * ============================================================================
 * GET COMPLETE MOVIE RECOMMENDATION RESULT
 * ============================================================================
 *
 * USE THIS IN results.tsx.
 *
 * Example:
 *
 * const result =
 *   await getMovieRecommendationResult(
 *     gameResults,
 *     3,
 *     "fa"
 *   );
 *
 * result.recommendations
 * result.profile
 * result.gamesAnalyzed
 *
 * ============================================================================
 */

export async function getMovieRecommendationResult(
  games: GameResult[],
  topK: number = DEFAULT_TOP_K,
  language: 'fa' | 'en' = 'en'
): Promise<MovieRecommendationResponse> {
  validateGames(games);

  const safeTopK =
    normalizeTopK(topK);

  const data =
    await requestMovieAPI(
      games,
      safeTopK,
      language
    );

  /**
   * Normalize movies with language.
   */
  const rawRecommendations =
    Array.isArray(
      data.recommendations
    )
      ? data.recommendations
      : [];

  const recommendations =
    rawRecommendations
      .map(
        movie =>
          normalizeMovie(
            movie,
            language
          )
      )
      .filter(
        (
          movie
        ): movie is MovieRecommendation =>
          movie !== null
      )
      .slice(
        0,
        safeTopK
      );

  /**
   * Normalize profile.
   */
  const profile =
    normalizeProfile(
      data.profile
    );

  const gamesAnalyzed =
    safeNumber(
      data.games_analyzed,
      games.length
    );

  const returnedTopK =
    safeNumber(
      data.top_k,
      safeTopK
    );

  console.log(
    '[MovieRecommendation] Success:',
    {
      gamesAnalyzed,
      recommendations:
        recommendations.length,
      topK:
        returnedTopK,
      profileLoaded:
        profile !== null,
      language,
    }
  );

  if (
    recommendations.length === 0
  ) {
    console.warn(
      '[MovieRecommendation] API returned zero recommendations.',
      data.message
        ? `Message: ${data.message}`
        : ''
    );
  }

  return {
    success:
      data.success !== false,

    recommendations,

    profile,

    gamesAnalyzed,

    topK:
      returnedTopK,

    message:
      typeof data.message === 'string'
        ? data.message
        : undefined,
  };
}


/**
 * ============================================================================
 * GET MOVIE RECOMMENDATIONS ONLY
 * ============================================================================
 *
 * Convenience function.
 *
 * Use this if the caller only needs the movies.
 *
 * ============================================================================
 */

export async function getMovieRecommendations(
  games: GameResult[],
  topK: number = DEFAULT_TOP_K,
  language: 'fa' | 'en' = 'en'
): Promise<MovieRecommendation[]> {
  const result =
    await getMovieRecommendationResult(
      games,
      topK,
      language
    );

  return result.recommendations;
}


/**
 * ============================================================================
 * GET TOP MOVIE RECOMMENDATIONS
 * ============================================================================
 *
 * Alias kept for compatibility with existing imports.
 *
 * ============================================================================
 */

export async function getTopMovieRecommendations(
  games: GameResult[],
  topK: number = DEFAULT_TOP_K,
  language: 'fa' | 'en' = 'en'
): Promise<MovieRecommendation[]> {
  return getMovieRecommendations(
    games,
    topK,
    language
  );
}


/**
 * ============================================================================
 * CHECK MOVIE API HEALTH
 * ============================================================================
 *
 * GET /health
 *
 * IMPORTANT:
 *
 * The current Colab API returns:
 *
 * {
 *   "status": "ok",
 *   "service": "norulia-movie-recommendation",
 *   "version": "3.0.0",
 *   "authentication": true,
 *   "engine_loaded": true,
 *   "minimum_games": 3,
 *   "bilingual": true
 * }
 *
 * We accept both the new v3 response and the older health response
 * so the app does not unnecessarily fail during development.
 *
 * ============================================================================
 */

export async function checkMovieRecommendationHealth(): Promise<boolean> {
  const endpoint =
    `${MOVIE_API_URL.replace(/\/+$/, '')}/health`;

  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(
      () => {
        controller.abort();
      },
      15000
    );

  try {
    const response =
      await fetch(
        endpoint,
        {
          method: 'GET',

          headers: {
            Accept:
              'application/json',
          },

          signal:
            controller.signal,
        }
      );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return false;
    }

    const data =
      await response.json();

    /**
     * Current API (v3):
     *
     * status = healthy
     * engine_loaded = true
     * bilingual = true
     */
    if (
      data?.status === 'healthy' &&
      data?.engine_loaded === true
    ) {
      return true;
    }

    /**
     * Backward compatibility with v2 API.
     */
    if (
      data?.status === 'ok' &&
      data?.engine_loaded === true
    ) {
      return true;
    }

    /**
     * Backward compatibility with older API.
     */
    if (
      data?.status === 'ok' &&
      data?.service ===
        'norulia-movie-recommendation'
    ) {
      return true;
    }

    return false;
  } catch (error) {
    clearTimeout(timeoutId);

    console.warn(
      '[MovieRecommendation] Health check failed:',
      error
    );

    return false;
  }
}


/**
 * ============================================================================
 * API URL HELPERS
 * ============================================================================
 *
 * Useful for debugging from results.tsx.
 * ============================================================================
 */

export function getMovieRecommendationApiUrl(): string {
  return MOVIE_API_URL;
}


/**
 * ============================================================================
 * DEBUG API CONNECTION
 * ============================================================================
 *
 * This function is optional.
 *
 * It performs the health request and returns useful information for logs.
 *
 * ============================================================================
 */

export type MovieRecommendationHealth = {
  reachable: boolean;

  status?: string;

  service?: string;

  version?: string;

  authentication?: boolean;

  engineLoaded?: boolean;

  minimumGames?: number;

  bilingual?: boolean;

  error?: string;
};

export async function getMovieRecommendationHealth(): Promise<MovieRecommendationHealth> {
  const endpoint =
    `${MOVIE_API_URL.replace(/\/+$/, '')}/health`;

  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(
      () => {
        controller.abort();
      },
      15000
    );

  try {
    const response =
      await fetch(
        endpoint,
        {
          method: 'GET',

          headers: {
            Accept:
              'application/json',
          },

          signal:
            controller.signal,
        }
      );

    clearTimeout(timeoutId);

    const text =
      await response.text();

    let data: any = null;

    try {
      data =
        text.trim()
          ? JSON.parse(text)
          : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      return {
        reachable: false,

        error:
          typeof data?.detail === 'string'
            ? data.detail
            : `HTTP ${response.status}`,
      };
    }

    return {
      reachable:
        data?.status === 'healthy' ||
        data?.status === 'ok',

      status:
        data?.status,

      service:
        data?.service,

      version:
        data?.version,

      authentication:
        data?.authentication,

      engineLoaded:
        data?.engine_loaded,

      minimumGames:
        safeNumber(
          data?.minimum_games,
          MINIMUM_GAMES
        ),

      bilingual:
        data?.bilingual === true,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    return {
      reachable: false,

      error:
        error instanceof Error
          ? error.message
          : 'Unknown network error',
    };
  }
}