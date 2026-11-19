
import { apiClient } from "../api-client";
import { authApi } from "../auth-api";

export interface Rating {
  ratingId: number;
  movieId: number;
  score: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export interface CreateRatingRequest {
  movieId: number;
  score: number;
  comment: string;
}

export interface UpdateRatingRequest {
  ratingId: number;
  score: number;
  comment: string;
}

// 1. 회원이 작성한 평점 목록 조회
// GET /members/:memberId/ratings
export async function getMemberRatings(
  memberId: number
): Promise<Rating[]> {
  return apiClient
    .get(`members/${memberId}/ratings`)
    .json<Rating[]>();
}

// 2. 평점 등록
// POST /ratings
export async function createRating(
  body: CreateRatingRequest
): Promise<Rating> {
  const response = await authApi
    .post("ratings", { json: body })
    .json<ApiResponse<Rating>>();

  return response.result;
}

// 3. 평점 수정
// PATCH /ratings/:ratingId
export async function updateRating({
  ratingId,
  score,
  comment,
}: UpdateRatingRequest): Promise<Rating> {
  const response = await authApi
    .patch(`ratings/${ratingId}`, {
      json: { score, comment },
    })
    .json<ApiResponse<Rating>>();

  return response.result;
}

// 4. 평점 삭제
// DELETE /ratings/:ratingId
export async function deleteRating(
  ratingId: number
): Promise<void> {
  await authApi.delete(`ratings/${ratingId}`);
}
