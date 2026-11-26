"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  createFavorite,
  deleteFavorite,
  getFavorites,
  getFavoriteStatus,
} from "../../api/favorites/favorites";
import { useAuthStore } from "../../stores/auth-store";

interface FavoriteButtonProps {
  movieId: number;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// 서버 응답에서 즐겨찾기 목록 추출
function getFavoriteList(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (!isObject(value)) return null;

  for (const key of ["result", "favorites", "items", "data"]) {
    if (key in value) {
      const found = getFavoriteList(value[key]);
      if (found) return found;
    }
  }

  return null;
}

// 서버 응답에서 즐겨찾기 여부 추출
function getIsFavorite(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === null) return false;
  if (!isObject(value)) return null;

  if ("result" in value) {
    return getIsFavorite(value.result);
  }

  for (const key of [
    "isFavorite",
    "isFavorited",
    "favorited",
    "exists",
  ]) {
    if (typeof value[key] === "boolean") {
      return value[key] as boolean;
    }
  }

  if ("favoriteId" in value || "movieId" in value) {
    return true;
  }

  return null;
}

export default function FavoriteButton({
  movieId,
}: FavoriteButtonProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ["favorites", "list"],
    queryFn: getFavorites,
    enabled: Boolean(accessToken),
    retry: false,
  });

  const statusQuery = useQuery({
    queryKey: ["favorites", "status", movieId],
    queryFn: () => getFavoriteStatus(movieId),
    enabled: Boolean(accessToken),
    retry: false,
  });

  const favorites = favoritesQuery.isSuccess
    ? getFavoriteList(favoritesQuery.data)
    : null;

  const isInList = favorites
    ? favorites.some(
        (item) =>
          isObject(item) && Number(item.movieId) === movieId
      )
    : null;

  const isFavorite =
    isInList ??
    (statusQuery.isSuccess
      ? getIsFavorite(statusQuery.data)
      : null);

  const refreshFavorites = () => {
    queryClient.invalidateQueries({
      queryKey: ["favorites"],
    });
  };

  const createMutation = useMutation({
    mutationFn: () => createFavorite(movieId),
    onSuccess: () => {
      alert("즐겨찾기에 등록했어요!");
      refreshFavorites();
    },
    onError: () => {
      alert("즐겨찾기 등록에 실패했어요.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFavorite(movieId),
    onSuccess: () => {
      alert("즐겨찾기를 해제했어요!");
      refreshFavorites();
    },
    onError: () => {
      alert("즐겨찾기 해제에 실패했어요.");
    },
  });

  if (!accessToken) {
    return (
      <p>
        즐겨찾기를 사용하려면 <Link href="/login">로그인</Link>해 주세요.
      </p>
    );
  }

  if (favoritesQuery.isPending || statusQuery.isPending) {
    return <p>즐겨찾기 상태 확인 중...</p>;
  }

  if (isFavorite === null) {
    return <p>즐겨찾기 상태를 확인하지 못했어요.</p>;
  }

  const isPending =
    createMutation.isPending || deleteMutation.isPending;

  return (
    <div style={{ marginTop: "24px", marginBottom: "24px" }}>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (isFavorite) {
            deleteMutation.mutate();
          } else {
            createMutation.mutate();
          }
        }}
        style={{
          padding: "14px 24px",
          backgroundColor: isFavorite ? "#ef4444" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: isPending ? "not-allowed" : "pointer",
          fontSize: "16px",
        }}
      >
        {isPending
          ? "처리 중..."
          : isFavorite
            ? "♥ 즐겨찾기 해제"
            : "♡ 즐겨찾기 등록"}
      </button>
    </div>
  );
}
