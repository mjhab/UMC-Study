
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import { getTmdbBackdropUrl, getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const isValidMovieId = Number.isInteger(movieId) && movieId > 0;

  const movieDetailQuery = useQuery({
    queryKey: ["movies", "detail", movieId],
    queryFn: () => getMovieDetail(movieId),
    enabled: isValidMovieId,
    staleTime: 30 * 1000,
  });

  const movie = movieDetailQuery.data;

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
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {movie.backdrop_path && (
        <img
          src={getTmdbBackdropUrl(movie.backdrop_path) || ""}
          alt={movie.title}
          style={{ width: "100%", borderRadius: "12px" }}
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
      <p>평점: ⭐ {movie.vote_average.toFixed(1)}</p>
      <p>상영 시간: {movie.runtime ?? "정보 없음"}분</p>
      <p>장르: {movie.genres.map((g) => g.name).join(", ")}</p>

      <h3>줄거리</h3>
      <p>{movie.overview || "등록된 줄거리가 없어요."}</p>
    </div>
  );
}
