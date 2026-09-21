import type { Movie } from "../types/movie";

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark: (movieId: number) => void;
}

function MovieCard({ movie, onToggleBookmark }: MovieCardProps) {
  return (
    <article className="movie-card">
      <div className="movie-poster">
        <img src={movie.posterPath} alt={movie.title} />

        <button
          className="bookmark-button"
          onClick={() => onToggleBookmark(movie.id)}
        >
          <img
            src={
              movie.isBookmarked
                ? "/icons/bookmark.svg"
                : "/icons/bookmark-outline.svg"
            }
            alt={movie.isBookmarked ? "북마크 해제" : "북마크"}
          />
        </button>
      </div>

      <h2>{movie.title}</h2>
      <p>{movie.releaseDate}</p>
    </article>
  );
}

export default MovieCard;