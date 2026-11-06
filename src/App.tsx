
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MovieListPage from "./pages/movies/movie-list-page";
import MovieDetailPage from "./pages/movies/movie-detail-page";
import SearchPage from "./pages/movies/search-page";

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: "20px" }}>
        <h1>UMC 6주차 필수미션</h1>

        <nav style={{ display: "flex", gap: "20px" }}>
          <Link to="/">영화 목록</Link>
          <Link to="/search">영화 검색</Link>
          <Link to="/movies/550">영화 상세</Link>
        </nav>

        <Routes>
          <Route path="/" element={<MovieListPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
