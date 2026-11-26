
"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import Link from "next/link";

import { getFavorites } from "../../api/favorites/favorites";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import { useAuthStore } from "../../stores/auth-store";

// 서버 응답에서 즐겨찾기 영화 ID 목록 추출
function extractMovieIds(value: unknown): number[] | null {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item !== "object" || item === null) {
          return null;
        }

        const movieId = Number(
          (item as Record<string, unknown>).movieId
        );

        return Number.isInteger(movieId) && movieId > 0
          ? movieId
          : null;
      })
      .filter((id): id is number => id !== null);
  }

  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;

    for (const key of [
      "result",
      "favorites",
      "items",
      "data",
      "content",
    ]) {
      if (key in obj) {
        const ids = extractMovieIds(obj[key]);

        if (ids !== null) {
          return ids;
        }
      }
    }
  }

  return null;
}

export default function FavoritesList() {
  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  // 즐겨찾기 목록 조회
  const favoritesQuery = useQuery({
    queryKey: ["favorites", "list"],
    queryFn: getFavorites,
    enabled: Boolean(accessToken),
    retry: false,
  });

  const movieIds = favoritesQuery.isSuccess
    ? extractMovieIds(favoritesQuery.data)
    : null;

  // 즐겨찾기한 영화들의 상세 정보 조회
  const movieQueries = useQueries({
    queries: (movieIds ?? []).map((movieId) => ({
      queryKey: ["movies", "detail", movieId],
      queryFn: () => getMovieDetail(movieId),
      staleTime: 30 * 1000,
    })),
  });

  if (!accessToken) {
    return <p>로그인이 필요합니다.</p>;
  }

  if (favoritesQuery.isPending) {
    return <p>즐겨찾기 목록을 불러오는 중...</p>;
  }

  if (favoritesQuery.isError || movieIds === null) {
    return <p>즐겨찾기 목록을 불러오지 못했습니다.</p>;
  }

  if (movieIds.length === 0) {
    return <p>아직 즐겨찾기한 영화가 없습니다.</p>;
  }

  return (
    <div>
      {movieIds.map((movieId, index) => {
        const movieQuery = movieQueries[index];

        const movieTitle =
          movieQuery?.data?.title ?? `영화 ${movieId}`;

        return (
          <div
            key={movieId}
            style={{
              padding: "12px",
              marginBottom: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <Link
              href={`/movies/${movieId}`}
              style={{
                color: "#2563eb",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              {movieQuery?.isPending
                ? "영화 정보 불러오는 중..."
                : movieTitle}
            </Link>

            <p
              style={{
                color: "#777",
                fontSize: "13px",
              }}
            >
              영화 ID: {movieId}
            </p>
          </div>
        );
      })}
    </div>
  );
}
