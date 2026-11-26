
import { Suspense } from "react";
import SearchPage from "../../views/movies/search-page";

export default function Page() {
  return (
    <Suspense fallback={<p>검색 페이지를 불러오는 중...</p>}>
      <SearchPage />
    </Suspense>
  );
}
