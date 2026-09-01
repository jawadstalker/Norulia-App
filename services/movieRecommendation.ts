
import { GameResult } from '../app/games/gameResults';

/*
|--------------------------------------------------------------------------
| Norulia Movie Recommendation API
|--------------------------------------------------------------------------
|
| The API is running from the Colab / ngrok ML service.
|
*/
const MOVIE_API_URL =
  'https://roundness-stuck-stretch.ngrok-free.dev';

/*
|--------------------------------------------------------------------------
| Movie recommendation types
|--------------------------------------------------------------------------
*/

export type MovieRecommendation = {
  movieId: number;
  title: string;
  overview: string;
  similarity: number;
  genres: string;
};

export type MovieRecommendationProfile = {
  traits: string[];
  preferences: string[];
};

export type MovieRecommendationResponse = {
  count: number;
  profile: MovieRecommendationProfile;
  recommendations: MovieRecommendation[];
};

/*
|--------------------------------------------------------------------------
| Request payload
|--------------------------------------------------------------------------
*/

type MovieRecommendationRequest = {
  games: GameResult[];
  top_k?: number;
};

/*
|--------------------------------------------------------------------------
| Get movie recommendations
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| results.tsx already loads the game results.
|
| Therefore this function receives those exact results instead
| of loading them again from AsyncStorage.
|
| Input:
|
|   getMovieRecommendations(results, 3)
|
| Output:
|
|   MovieRecommendation[]
|
|--------------------------------------------------------------------------
*/

export async function getMovieRecommendations(
  games: GameResult[],
  topK: number = 3
): Promise<MovieRecommendation[]> {
  /*
   * Validate game results.
   */

  if (!Array.isArray(games)) {
    throw new Error(
      'Invalid game results provided for movie recommendation.'
    );
  }

  if (!games.length) {
    throw new Error(
      'No game results are available for movie recommendation.'
    );
  }

  /*
   * Keep top_k safe.
   *
   * The Norulia UI currently displays three movies,
   * so we limit the request to a reasonable range.
   */

  const safeTopK = Math.max(
    1,
    Math.min(
      10,
      Math.floor(
        Number(topK) || 3
      )
    )
  );

  /*
   * Build API payload.
   */

  const payload: MovieRecommendationRequest = {
    games,
    top_k: safeTopK,
  };

  /*
   * Send request to ML API.
   */

  let response: Response;

  try {
    response = await fetch(
      `${MOVIE_API_URL}/recommend`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          Accept:
            'application/json',
        },

        body: JSON.stringify(
          payload
        ),
      }
    );
  } catch (error) {
    console.warn(
      '[MovieRecommendation] Network request failed:',
      error
    );

    throw new Error(
      'Could not connect to the movie recommendation service.'
    );
  }

  /*
   * Handle HTTP errors.
   */

  if (!response.ok) {
    let errorMessage =
      `Movie recommendation API failed (${response.status})`;

    try {
      const errorBody =
        await response.json();

      if (
        typeof errorBody?.detail ===
        'string'
      ) {
        errorMessage =
          errorBody.detail;
      } else if (
        typeof errorBody?.message ===
        'string'
      ) {
        errorMessage =
          errorBody.message;
      }
    } catch {
      /*
       * Ignore invalid error response.
       */
    }

    throw new Error(
      errorMessage
    );
  }

  /*
   * Parse response.
   */

  let data:
    | MovieRecommendationResponse
    | null = null;

  try {
    data =
      (await response.json()) as MovieRecommendationResponse;
  } catch (error) {
    console.warn(
      '[MovieRecommendation] Invalid JSON response:',
      error
    );

    throw new Error(
      'Invalid response from movie recommendation API.'
    );
  }

  /*
   * Validate recommendations.
   */

  if (
    !data ||
    !Array.isArray(
      data.recommendations
    )
  ) {
    throw new Error(
      'Invalid response from movie recommendation API.'
    );
  }

  /*
   * Normalize recommendation data.
   *
   * This protects the React Native UI from malformed
   * values coming from the ML API.
   */

  const recommendations =
    data.recommendations
      .filter(
        (movie) =>
          movie &&
          typeof movie.title ===
            'string'
      )
      .map(
        (movie) => ({
          movieId:
            Number(
              movie.movieId
            ) || 0,

          title:
            movie.title || '',

          overview:
            typeof movie.overview ===
            'string'
              ? movie.overview
              : '',

          similarity:
            Number.isFinite(
              Number(
                movie.similarity
              )
            )
              ? Number(
                  movie.similarity
                )
              : 0,

          genres:
            typeof movie.genres ===
            'string'
              ? movie.genres
              : '',
        })
      )
      .slice(
        0,
        safeTopK
      );

  return recommendations;
}

/*
|--------------------------------------------------------------------------
| Get top movie recommendations
|--------------------------------------------------------------------------
|
| Convenience helper for places where the caller wants to use
| the game results directly and receive only the top movies.
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

