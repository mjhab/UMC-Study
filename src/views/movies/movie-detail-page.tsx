"use client";
import FavoriteButton from "../../components/movies/favorite-button";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { getMovieDetail } from "../../api/movies/get-movie-detail";
import {
  getTmdbBackdropUrl,
  getTmdbPosterUrl,
} from "../../utils/movies/tmdb-image";

import {
  getMemberRatings,
  createRating,
  updateRating,
  deleteRating,
} from "../../api/ratings/ratings";

import { useAuthStore } from "../../stores/auth-store";

// JWT의 sub에서 로그인한 회원 ID 확인
function getMemberIdFromToken(
  accessToken: string | null
): number | null {
  if (!accessToken) return null;

  try {
    const payloadPart = accessToken.split(".")[1];

    if (!payloadPart) return null;

    const base64 = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "="
    );

    const payload = JSON.parse(atob(padded));
    const memberId = Number(payload.sub);

    return Number.isInteger(memberId) && memberId > 0
      ? memberId
      : null;
  } catch {
    return null;
  }
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();

  const movieId = Number(id);
  const isValidMovieId =
    Number.isInteger(movieId) && movieId > 0;

  const queryClient = useQueryClient();

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const memberId = getMemberIdFromToken(accessToken);

  // 평점 작성 및 수정 입력값
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [editingRatingId, setEditingRatingId] =
    useState<number | null>(null);

  // 영화 상세 조회
  const movieDetailQuery = useQuery({
    queryKey: ["movies", "detail", movieId],
    queryFn: () => getMovieDetail(movieId),
    enabled: isValidMovieId,
    staleTime: 30 * 1000,
  });

  // 현재 로그인한 회원의 평점 목록 조회
  const ratingsQuery = useQuery({
    queryKey: ["ratings", "member", memberId],
    queryFn: () => getMemberRatings(memberId!),
    enabled: memberId !== null,
    retry: false,
  });

  // 평점 등록
  const createRatingMutation = useMutation({
    mutationFn: createRating,

    onSuccess: () => {
      alert("평점이 등록되었습니다.");

      setScore(5);
      setComment("");

      queryClient.invalidateQueries({
        queryKey: ["ratings", "member", memberId],
      });
    },

    onError: () => {
      alert("평점 등록에 실패했습니다.");
    },
  });

  // 평점 수정
  const updateRatingMutation = useMutation({
    mutationFn: updateRating,

    onSuccess: () => {
      alert("평점이 수정되었습니다.");

      setEditingRatingId(null);
      setScore(5);
      setComment("");

      queryClient.invalidateQueries({
        queryKey: ["ratings", "member", memberId],
      });
    },

    onError: () => {
      alert("평점 수정에 실패했습니다.");
    },
  });

  // 평점 삭제
  const deleteRatingMutation = useMutation({
    mutationFn: deleteRating,

    onSuccess: () => {
      alert("평점이 삭제되었습니다.");

      setEditingRatingId(null);
      setScore(5);
      setComment("");

      queryClient.invalidateQueries({
        queryKey: ["ratings", "member", memberId],
      });
    },

    onError: () => {
      alert("평점 삭제에 실패했습니다.");
    },
  });

  const movie = movieDetailQuery.data;

  // 현재 영화에 대해 내가 작성한 평점 찾기
  const myRating = ratingsQuery.data?.find(
    (rating) => Number(rating.movieId) === movieId
  );

  const isMutating =
    createRatingMutation.isPending ||
    updateRatingMutation.isPending ||
    deleteRatingMutation.isPending;

  // 평점 등록 또는 수정
  const handleRatingSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!accessToken || memberId === null || isMutating) {
      return;
    }

    if (!comment.trim()) {
      alert("평점 내용을 입력해 주세요.");
      return;
    }

    if (editingRatingId !== null) {
      updateRatingMutation.mutate({
        ratingId: editingRatingId,
        score,
        comment: comment.trim(),
      });
    } else {
      createRatingMutation.mutate({
        movieId,
        score,
        comment: comment.trim(),
      });
    }
  };

  // 수정 버튼 클릭
  const handleEdit = () => {
    if (!myRating) return;

    setEditingRatingId(myRating.ratingId);
    setScore(myRating.score);
    setComment(myRating.comment);
  };

  // 삭제 버튼 클릭
  const handleDelete = () => {
    if (!myRating || isMutating) return;

    const confirmed = window.confirm(
      "정말 이 평점을 삭제하시겠습니까?"
    );

    if (!confirmed) return;

    deleteRatingMutation.mutate(myRating.ratingId);
  };

  if (!isValidMovieId) {
    return <p>유효하지 않은 영화 ID예요.</p>;
  }

  if (movieDetailQuery.isPending) {
    return <p>영화 상세 정보를 불러오는 중이에요...</p>;
  }

  if (movieDetailQuery.isError) {
    return <p>영화 상세 정보를 불러오지 못했어요.</p>;
  }

  if (!movie) {
    return <p>영화 정보를 찾을 수 없어요.</p>;
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {/* 기존 영화 상세 정보 */}
      {movie.backdrop_path && (
        <img
          src={getTmdbBackdropUrl(movie.backdrop_path) || ""}
          alt={movie.title}
          style={{
            width: "100%",
            borderRadius: "12px",
          }}
        />
      )}

      <h1>{movie.title}</h1>

      {movie.poster_path && (
        <img
          src={getTmdbPosterUrl(movie.poster_path) || ""}
          alt={movie.title}
          style={{ width: "200px" }}
        />
      )}

      <p>개봉일: {movie.release_date}</p>

      <p>
        평점: ⭐ {movie.vote_average.toFixed(1)}
      </p>

      <p>
        상영 시간: {movie.runtime ?? "정보 없음"}분
      </p>

      <p>
        장르: {movie.genres.map((g) => g.name).join(", ")}
      </p>

      <h3>줄거리</h3>
      <p>{movie.overview || "등록된 줄거리가 없어요."}</p>

      <FavoriteButton movieId={movieId} />

      {/* 8주차: 평점 API 연동 */}
      <section
        style={{
          marginTop: "40px",
          padding: "24px",
          border: "1px solid #ddd",
          borderRadius: "12px",
        }}
      >
        <h2>내 영화 평점</h2>

        {!accessToken || memberId === null ? (
          <div>
            <p>평점을 작성하려면 로그인이 필요합니다.</p>
            <Link href="/login">로그인하기</Link>
          </div>
        ) : ratingsQuery.isPending ? (
          <p>내 평점을 불러오는 중...</p>
        ) : ratingsQuery.isError ? (
          <p>평점 정보를 불러오지 못했습니다.</p>
        ) : (
          <>
            {/* 기존에 작성한 평점 */}
            {myRating && (
              <div
                style={{
                  padding: "16px",
                  marginBottom: "24px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "8px",
                }}
              >
                <h3>내가 작성한 평점</h3>

                <p>⭐ {myRating.score} / 5</p>
                <p>{myRating.comment}</p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleEdit}
                    disabled={isMutating}
                  >
                    수정
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isMutating}
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}

            {/* 새 평점 등록 또는 기존 평점 수정 */}
            {(!myRating || editingRatingId !== null) && (
              <form onSubmit={handleRatingSubmit}>
                <h3>
                  {editingRatingId !== null
                    ? "평점 수정"
                    : "평점 작성"}
                </h3>

                <div style={{ marginBottom: "16px" }}>
                  <label htmlFor="rating-score">
                    평점
                  </label>

                  <select
                    id="rating-score"
                    value={score}
                    onChange={(e) =>
                      setScore(Number(e.target.value))
                    }
                    style={{
                      display: "block",
                      padding: "10px",
                      marginTop: "8px",
                    }}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5점</option>
                    <option value={4}>⭐⭐⭐⭐ 4점</option>
                    <option value={3}>⭐⭐⭐ 3점</option>
                    <option value={2}>⭐⭐ 2점</option>
                    <option value={1}>⭐ 1점</option>
                  </select>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label htmlFor="rating-comment">
                    감상평
                  </label>

                  <textarea
                    id="rating-comment"
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                    placeholder="영화에 대한 감상평을 작성해 주세요."
                    style={{
                      display: "block",
                      width: "100%",
                      minHeight: "100px",
                      padding: "12px",
                      marginTop: "8px",
                      boxSizing: "border-box",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!comment.trim() || isMutating}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  {isMutating
                    ? "처리 중..."
                    : editingRatingId !== null
                      ? "수정 완료"
                      : "평점 등록"}
                </button>

                {editingRatingId !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRatingId(null);
                      setScore(5);
                      setComment("");
                    }}
                    style={{
                      marginLeft: "10px",
                      padding: "12px",
                    }}
                  >
                    취소
                  </button>
                )}
              </form>
            )}
          </>
        )}
      </section>
    </div>
  );
}
