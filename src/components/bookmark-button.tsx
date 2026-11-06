import { useBookmarkStore } from "../stores/bookmark-store";

interface BookmarkButtonProps {
  movieId: number;
}

export function BookmarkButton({ movieId }: BookmarkButtonProps) {
  const isBookmarked = useBookmarkStore((state) =>
    state.bookmarkedMovieIds.includes(movieId)
  );
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);

  return (
    <button 
      type="button" 
      onClick={() => toggleBookmark(movieId)}
      style={{ padding: '8px 12px', cursor: 'pointer', marginTop: '10px' }}
    >
      {isBookmarked ? "❤️ 북마크 해제" : "🤍 북마크 추가"}
    </button>
  );
}