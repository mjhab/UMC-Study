
import { FavoriteResponseDto } from "./favorite-response.dto";

export interface MovieRecordRatingResponse {
  ratingId: number;
  movieId: number;
  score: number;
  comment: string | null;
}

export class MovieRecordResponseDto {
  rating: MovieRecordRatingResponse;
  favorite: FavoriteResponseDto | null;

  static of(
    rating: MovieRecordRatingResponse,
    favorite: FavoriteResponseDto | null,
  ): MovieRecordResponseDto {
    return { rating, favorite };
  }
}
