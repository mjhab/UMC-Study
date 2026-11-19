
import { authApi } from "../auth-api";

export interface Favorite {
  favoriteId: number;
  movieId: number;
  createdAt: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// 1. 즐겨찾기 등록
// POST /v8/favorites
export async function createFavorite(
  movieId: number
): Promise<Favorite> {
  const response = await authApi
    .post("favorites", {
      json: { movieId },
    })
    .json<ApiResponse<Favorite>>();

  return response.result;
}

// 2. 내 즐겨찾기 목록 조회
// GET /v8/favorites
export async function getFavorites(): Promise<unknown> {
  return authApi.get("favorites").json<unknown>();
}

// 3. 특정 영화 즐겨찾기 여부 조회
// GET /v8/favorites/:movieId
export async function getFavoriteStatus(
  movieId: number
): Promise<unknown> {
  return authApi
.get(`favorites/${movieId}`)
    .json<unknown>();
}

// 4. 즐겨찾기 삭제
// DELETE /v8/favorites/:movieId
export async function deleteFavorite(
  movieId: number
): Promise<void> {
  await authApi.delete(`favorites/${movieId}`);
}
