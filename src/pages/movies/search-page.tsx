
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { searchMovies } from "../../api/movies/search-movies";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query")?.trim() ?? "";
  const [input, setInput] = useState(query);

  const searchQuery = useQuery({
    queryKey: ["movies", "search", { query }],
    queryFn: () => searchMovies({ query }),
    enabled: query.length > 0,
  });

  const movies = searchQuery.data?.results ?? [];

  return (
    <div style={{ padding: "20px" }}>
      <h2>영화 검색</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearchParams(
            input.trim() ? { query: input.trim() } : {}
          );
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="영화 제목 입력"
        />
        <button type="submit">검색</button>
      </form>

      {!query ? (
        <p>검색어를 입력해 주세요.</p>
      ) : searchQuery.isLoading ? (
        <p>검색 결과를 불러오는 중이에요.</p>
      ) : searchQuery.isError ? (
        <p>검색 중 오류가 발생했어요.</p>
      ) : searchQuery.isSuccess && movies.length === 0 ? (
        <p>검색 결과가 없어요.</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}>
          {movies.map((movie) => (
            <Link key={movie.id} to={`/movies/${movie.id}`}>
              {movie.poster_path && (
                <img
                  src={getTmdbPosterUrl(movie.poster_path) || ""}
                  alt={movie.title}
                  style={{ width: "100%" }}
                />
              )}
              <p>{movie.title}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
