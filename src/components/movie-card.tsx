interface MovieCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  movie: any;
  onToggleBookmark?: (movieId: number) => void;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div style={{ width: "200px" }}>
      <h3>{movie.title}</h3>
    </div>
  );
}