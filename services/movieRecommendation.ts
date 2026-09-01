
import { GameResult } from '../app/games/gameResults';

/*
|--------------------------------------------------------------------------
| Norulia Movie Recommendation API
|--------------------------------------------------------------------------
|
| Backend:
| Google Colab + FastAPI + ngrok
|
| Current API:
| POST /recommend
|
| Authentication:
| X-API-Key
|
|--------------------------------------------------------------------------
*/

const MOVIE_API_URL =
  'https://roundness-stuck-stretch.ngrok-free.dev';

const MOVIE_API_KEY =
  '3IhN7vwOx7PIS5SxD5zBzezSVih_Yb6aBheAMq9ypaQKPB3G';

const AUTH_HEADER_NAME = 'X-API-Key';

const MINIMUM_GAMES = 3;

/*
|--------------------------------------------------------------------------
| Movie Recommendation
|--------------------------------------------------------------------------
*/

export type MovieRecommendation = {
  movieId: number;
  title: string;
  overview: string;
  genres: string[];
  similarity: number;
  matchedTags: string[];
};

/*
|--------------------------------------------------------------------------
| Cognitive Profile
|--------------------------------------------------------------------------
*/

export type MovieRecommendationProfile = {
  gamesAnalyzed: number;

  dimensions: {
    processing_speed: number;
    attention: number;
    memory: number;
    motor_accuracy: number;
    resilience: number;
    reasoning: number;
  };

  rawMetrics: Record<string, number>;

  traits: string[];

  preferences: string[];
};

/*
|--------------------------------------------------------------------------
| Full API Response
|--------------------------------------------------------------------------
*/

export type MovieRecommendationResponse = {
  success: boolean;

  recommendations: MovieRecommendation[];

  profile: MovieRecommendationProfile | null;

  gamesAnalyzed: number;

  topK: number;

  message?: string;
};

/*
|--------------------------------------------------------------------------
| API Request
|--------------------------------------------------------------------------
*/

type MovieRecommendationRequest = {
  games: GameResult[];
  top_k: number;
};

/*
|--------------------------------------------------------------------------
| Raw API Movie
|--------------------------------------------------------------------------
|
| This matches the actual Colab response:
|
| {
|   "movie_id": 497,
|   "title": "The Green Mile",
|   "overview": "...",
|   "genres": ["Drama", "Fantasy"],
|   "similarity": 0.3667,
|   "matched_tags": ["emotional", "thoughtful"]
| }
|
|--------------------------------------------------------------------------
*/

type RawMovieRecommendation = {
  movie_id?: number | string;

  title?: string;

  overview?: string;

  genres?: string[] | string;

  similarity?: number | string;

  matched_tags?: string[];
};

/*
|--------------------------------------------------------------------------
| Raw Cognitive Profile
|--------------------------------------------------------------------------
*/

type RawMovieRecommendationProfile = {
  games_analyzed?: number;

  dimensions?: {
    processing_speed?: number;
    attention?: number;
    memory?: number;
    motor_accuracy?: number;
    resilience?: number;
    reasoning?: number;
  };

  raw_metrics?: Record<string, number>;

  traits?: string[];

  preferences?: string[];
};

/*
|--------------------------------------------------------------------------
| Raw API Response
|--------------------------------------------------------------------------
*/

type RawMovieRecommendationResponse = {
  success?: boolean;

  recommendations?: RawMovieRecommendation[];

  profile?: RawMovieRecommendationProfile;

  games_analyzed?: number;

  top_k?: number;

  message?: string;
};

/*
|--------------------------------------------------------------------------
| Normalize Movie
|--------------------------------------------------------------------------
*/

function normalizeMovie(
  movie: RawMovieRecommendation
): MovieRecommendation | null {

  if (!movie || typeof movie !== 'object') {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Title
  |--------------------------------------------------------------------------
  */

  const title =
    typeof movie.title === 'string'
      ? movie.title.trim()
      : '';

  if (!title) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Movie ID
  |--------------------------------------------------------------------------
  */

  const parsedMovieId =
    Number(movie.movie_id);

  const movieId =
    Number.isFinite(parsedMovieId)
      ? parsedMovieId
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Overview
  |--------------------------------------------------------------------------
  */

  const overview =
    typeof movie.overview === 'string'
      ? movie.overview
      : '';

  /*
  |--------------------------------------------------------------------------
  | Similarity
  |--------------------------------------------------------------------------
  */

  const parsedSimilarity =
    Number(movie.similarity);

  const similarity =
    Number.isFinite(parsedSimilarity)
      ? parsedSimilarity
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Genres
  |--------------------------------------------------------------------------
  */

  let genres: string[] = [];

  if (Array.isArray(movie.genres)) {

    genres = movie.genres
      .filter(
        (genre): genre is string =>
          typeof genre === 'string'
      )
      .map(
        genre => genre.trim()
      )
      .filter(Boolean);

  } else if (
    typeof movie.genres === 'string'
  ) {

    genres =
      movie.genres
        .split(',')
        .map(
          genre => genre.trim()
        )
        .filter(Boolean);
  }

  /*
  |--------------------------------------------------------------------------
  | Matched Tags
  |--------------------------------------------------------------------------
  */

  const matchedTags =
    Array.isArray(movie.matched_tags)
      ? movie.matched_tags
          .filter(
            (tag): tag is string =>
              typeof tag === 'string'
          )
          .map(
            tag => tag.trim()
          )
          .filter(Boolean)
      : [];

  return {
    movieId,
    title,
    overview,
    genres,
    similarity,
    matchedTags,
  };
}

/*
|--------------------------------------------------------------------------
| Normalize Cognitive Profile
|--------------------------------------------------------------------------
*/

function normalizeProfile(
  profile?: RawMovieRecommendationProfile
): MovieRecommendationProfile | null {

  if (!profile) {
    return null;
  }

  const dimensions =
    profile.dimensions ?? {};

  return {
    gamesAnalyzed:
      Number(
        profile.games_analyzed ?? 0
      ),

    dimensions: {
      processing_speed:
        Number(
          dimensions.processing_speed ?? 0
        ),

      attention:
        Number(
          dimensions.attention ?? 0
        ),

      memory:
        Number(
          dimensions.memory ?? 0
        ),

      motor_accuracy:
        Number(
          dimensions.motor_accuracy ?? 0
        ),

      resilience:
        Number(
          dimensions.resilience ?? 0
        ),

      reasoning:
        Number(
          dimensions.reasoning ?? 0
        ),
    },

    rawMetrics:
      profile.raw_metrics ?? {},

    traits:
      Array.isArray(profile.traits)
        ? profile.traits.filter(
            item =>
              typeof item === 'string'
          )
        : [],

    preferences:
      Array.isArray(
        profile.preferences
      )
        ? profile.preferences.filter(
            item =>
              typeof item === 'string'
          )
        : [],
  };
}

/*
|--------------------------------------------------------------------------
| Get Movie Recommendations
|--------------------------------------------------------------------------
|
| This is the main function used by results.tsx.
|
| Example:
|
| const movies =
|   await getMovieRecommendations(
|     gameResults,
|     3
|   );
|
|--------------------------------------------------------------------------
*/

export async function getMovieRecommendations(
  games: GameResult[],
  topK: number = 3
): Promise<MovieRecommendation[]> {

  /*
  |--------------------------------------------------------------------------
  | Validate input
  |--------------------------------------------------------------------------
  */

  if (!Array.isArray(games)) {

    throw new Error(
      'Invalid game results provided for movie recommendation.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Minimum games
  |--------------------------------------------------------------------------
  |
  | Norulia requires at least 3 completed sessions.
  |
  |--------------------------------------------------------------------------
  */

  if (
    games.length <
    MINIMUM_GAMES
  ) {

    throw new Error(
      `At least ${MINIMUM_GAMES} game sessions are required before movie recommendations can be generated.`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize topK
  |--------------------------------------------------------------------------
  */

  const parsedTopK =
    Number(topK);

  const safeTopK =
    Number.isFinite(parsedTopK)
      ? Math.max(
          1,
          Math.min(
            10,
            Math.floor(
              parsedTopK
            )
          )
        )
      : 3;

  /*
  |--------------------------------------------------------------------------
  | Build payload
  |--------------------------------------------------------------------------
  */

  const payload:
    MovieRecommendationRequest = {
    games,
    top_k: safeTopK,
  };

  const endpoint =
    `${MOVIE_API_URL}/recommend`;

  /*
  |--------------------------------------------------------------------------
  | Debug
  |--------------------------------------------------------------------------
  */

  console.log(
    '[MovieRecommendation] Request:',
    {
      endpoint,
      games: games.length,
      topK: safeTopK,
    }
  );

  /*
  |--------------------------------------------------------------------------
  | API Request
  |--------------------------------------------------------------------------
  */

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

            /*
            |--------------------------------------------------------------------------
            | REQUIRED AUTHENTICATION
            |--------------------------------------------------------------------------
            */

            [AUTH_HEADER_NAME]:
              MOVIE_API_KEY,
          },

          body:
            JSON.stringify(
              payload
            ),
        }
      );

  } catch (error) {

    console.error(
      '[MovieRecommendation] Network error:',
      error
    );

    throw new Error(
      'Could not connect to the Norulia movie recommendation service.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Read response body once
  |--------------------------------------------------------------------------
  */

  const responseText =
    await response.text();

  /*
  |--------------------------------------------------------------------------
  | Parse JSON
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | HTTP Errors
  |--------------------------------------------------------------------------
  */

  if (!response.ok) {

    let errorMessage =
      `Movie recommendation API failed (${response.status})`;

    const errorData =
      data as (
        RawMovieRecommendationResponse & {
          detail?: string;
        }
      ) | null;

    if (
      typeof errorData?.detail ===
      'string'
    ) {

      errorMessage =
        errorData.detail;

    } else if (
      typeof data?.message ===
      'string'
    ) {

      errorMessage =
        data.message;
    }

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

    /*
    |--------------------------------------------------------------------------
    | Authentication Error
    |--------------------------------------------------------------------------
    */

    if (
      response.status === 401
    ) {

      throw new Error(
        'Movie recommendation authentication failed. Check the API key.'
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Minimum Games Error
    |--------------------------------------------------------------------------
    */

    if (
      response.status === 400
    ) {

      throw new Error(
        errorMessage
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Endpoint / ngrok Error
    |--------------------------------------------------------------------------
    */

    if (
      response.status === 404
    ) {

      throw new Error(
        'Movie recommendation endpoint was not found. Make sure the Colab runtime and ngrok tunnel are still running.'
      );
    }

    throw new Error(
      errorMessage
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Empty response
  |--------------------------------------------------------------------------
  */

  if (!data) {

    throw new Error(
      'Movie recommendation API returned an empty response.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | API success
  |--------------------------------------------------------------------------
  */

  if (
    data.success === false
  ) {

    throw new Error(
      data.message ||
      'Movie recommendation service failed.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Recommendations
  |--------------------------------------------------------------------------
  */

  const rawRecommendations =
    Array.isArray(
      data.recommendations
    )
      ? data.recommendations
      : [];

  /*
  |--------------------------------------------------------------------------
  | Normalize
  |--------------------------------------------------------------------------
  */

  const recommendations =
    rawRecommendations
      .map(
        normalizeMovie
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

  /*
  |--------------------------------------------------------------------------
  | Log result
  |--------------------------------------------------------------------------
  */

  console.log(
    '[MovieRecommendation] Success:',
    {
      gamesAnalyzed:
        data.games_analyzed ??
        games.length,

      recommendations:
        recommendations.length,

      topK:
        safeTopK,
    }
  );

  /*
  |--------------------------------------------------------------------------
  | No recommendations
  |--------------------------------------------------------------------------
  */

  if (
    recommendations.length === 0
  ) {

    console.warn(
      '[MovieRecommendation] API returned zero recommendations.'
    );
  }

  return recommendations;
}

/*
|--------------------------------------------------------------------------
| Get Complete Recommendation Result
|--------------------------------------------------------------------------
|
| Use this when results.tsx also needs:
|
| - movies
| - cognitive profile
| - traits
| - preferences
| - games analyzed
|
|--------------------------------------------------------------------------
*/

export async function getMovieRecommendationResult(
  games: GameResult[],
  topK: number = 3
): Promise<MovieRecommendationResponse> {

  /*
  |--------------------------------------------------------------------------
  | Validate games
  |--------------------------------------------------------------------------
  */

  if (!Array.isArray(games)) {

    throw new Error(
      'Invalid game results provided for movie recommendation.'
    );
  }

  if (
    games.length <
    MINIMUM_GAMES
  ) {

    throw new Error(
      `At least ${MINIMUM_GAMES} game sessions are required before movie recommendations can be generated.`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Safe topK
  |--------------------------------------------------------------------------
  */

  const parsedTopK =
    Number(topK);

  const safeTopK =
    Number.isFinite(parsedTopK)
      ? Math.max(
          1,
          Math.min(
            10,
            Math.floor(
              parsedTopK
            )
          )
        )
      : 3;

  /*
  |--------------------------------------------------------------------------
  | Request
  |--------------------------------------------------------------------------
  */

  let response: Response;

  try {

    response =
      await fetch(
        `${MOVIE_API_URL}/recommend`,
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
            JSON.stringify({
              games,
              top_k:
                safeTopK,
            }),
        }
      );

  } catch (error) {

    console.error(
      '[MovieRecommendation] Network error:',
      error
    );

    throw new Error(
      'Could not connect to the Norulia movie recommendation service.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Parse body
  |--------------------------------------------------------------------------
  */

  const responseText =
    await response.text();

  let data:
    RawMovieRecommendationResponse |
    null = null;

  try {

    data =
      responseText.trim()
        ? JSON.parse(
            responseText
          )
        : null;

  } catch {

    throw new Error(
      'Invalid JSON returned by the movie recommendation service.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | HTTP error
  |--------------------------------------------------------------------------
  */

  if (!response.ok) {

    const errorData =
      data as (
        RawMovieRecommendationResponse & {
          detail?: string;
        }
      ) | null;

    const message =
      typeof errorData?.detail ===
      'string'
        ? errorData.detail
        : (
            data?.message ||
            `Movie recommendation API failed (${response.status})`
          );

    if (
      response.status === 401
    ) {

      throw new Error(
        'Movie recommendation authentication failed.'
      );
    }

    throw new Error(
      message
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Empty response
  |--------------------------------------------------------------------------
  */

  if (!data) {

    throw new Error(
      'Empty response from movie recommendation API.'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize movies
  |--------------------------------------------------------------------------
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
        normalizeMovie
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

  /*
  |--------------------------------------------------------------------------
  | Normalize profile
  |--------------------------------------------------------------------------
  */

  const profile =
    normalizeProfile(
      data.profile
    );

  /*
  |--------------------------------------------------------------------------
  | Return complete response
  |--------------------------------------------------------------------------
  */

  return {
    success:
      data.success !== false,

    recommendations,

    profile,

    gamesAnalyzed:
      Number(
        data.games_analyzed ??
        games.length
      ),

    topK:
      Number(
        data.top_k ??
        safeTopK
      ),

    message:
      typeof data.message === 'string'
        ? data.message
        : undefined,
  };
}

/*
|--------------------------------------------------------------------------
| Get Top Movie Recommendations
|--------------------------------------------------------------------------
|
| Convenience wrapper.
|
|--------------------------------------------------------------------------
*/

export async function getTopMovieRecommendations(
  games: GameResult[],
  topK: number = 3
): Promise<MovieRecommendation[]> {

  return getMovieRecommendations(
    games,
    topK
  );
}

/*
|--------------------------------------------------------------------------
| Check API Health
|--------------------------------------------------------------------------
*/

export async function checkMovieRecommendationHealth(): Promise<boolean> {

  try {

    const response =
      await fetch(
        `${MOVIE_API_URL}/health`,
        {
          method: 'GET',

          headers: {
            Accept:
              'application/json',
          },
        }
      );

    if (!response.ok) {
      return false;
    }

    const data =
      await response.json();

    return (
      data?.status === 'ok' &&
      data?.engine_loaded === true
    );

  } catch (error) {

    console.warn(
      '[MovieRecommendation] Health check failed:',
      error
    );

    return false;
  }
}

