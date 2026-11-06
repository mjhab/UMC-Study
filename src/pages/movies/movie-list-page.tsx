
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getMovies } from "../../api/movies/get-movies";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

export default function MovieListPage() {
  const [page, setPage] = useState(1);

  const moviesQuery = useQuery({
    queryKey: ["movies", "list", { page }],
    queryFn: () => getMovies({ page }),
  });

  const movies = moviesQuery.data?.results ?? [];
  const totalPages = moviesQuery.data?.total_pages ?? 0;

  return (
    <div style={{ padding: "20px" }}>
      <h2>인기 영화 목록</h2>

      {moviesQuery.isPending ? (
        <p>영화를 불러오는 중이에요.</p>
      ) : moviesQuery.isError ? (
        <p>영화 목록을 불러오지 못했어요.</p>
      ) : movies.length === 0 ? (
        <p>표시할 영화가 없어요.</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "20px",
            }}
          >
            {movies.map((movie) => (
              <Link
                key={movie.id}
                to={`/movies/${movie.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div>
                  {movie.poster_path ? (
                    <img
                      src={getTmdbPosterUrl(movie.poster_path) || ""}
                      alt={movie.title}
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  ) : (
                    <p>이미지 없음</p>
                  )}
                  <h3>{movie.title}</h3>
                  <p>⭐ {movie.vote_average.toFixed(1)}</p>
                </div>
              </Link>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
              marginTop: "30px",
            }}
          >
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              이전
            </button>

            <span>
              {page} / {totalPages} 페이지
            </span>

            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= totalPages}
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
}
