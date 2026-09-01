import { getGameResults, GameResult } from '../app/games/gameResults';

const MOVIE_API_URL =
  'https://roundness-stuck-stretch.ngrok-free.dev';

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

type MovieRecommendationRequest = {
  games: GameResult[];
  top_k?: number;
};

/**
 * Send Norulia game results to the Colab ML API.
 */
export async function getMovieRecommendations(
  topK: number = 3
): Promise<MovieRecommendationResponse> {
  const games = await getGameResults();

  if (!games.length) {
    throw new Error(
      'No game results are available for movie recommendation.'
    );
  }

  const payload: MovieRecommendationRequest = {
    games,
    top_k: topK,
  };

  const response = await fetch(
    `${MOVIE_API_URL}/recommend`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },

      body: JSON.stringify(payload),
    }
  );

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
      }
    } catch {
      // Ignore invalid error body.
    }

    throw new Error(errorMessage);
  }

  const data =
    (await response.json()) as MovieRecommendationResponse;

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

  return data;
}

/**
 * Convenience helper:
 * returns only the three recommended movies.
 */
export async function getTopMovieRecommendations(): Promise<
  MovieRecommendation[]
> {
  const result =
    await getMovieRecommendations(3);

  return result.recommendations;
}