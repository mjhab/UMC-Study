
import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MovieListPage from "./pages/movies/movie-list-page";
import MovieDetailPage from "./pages/movies/movie-detail-page";
import SearchPage from "./pages/movies/search-page";
import SignupPage from "./pages/auth/signup-page";
import LoginPage from "./pages/auth/login-page";
import {
  MyPage,
  EditProfilePage,
  type Profile,
} from "./pages/mypage/profile-pages";

function App() {
  // 7주차 화면 확인용 임시 회원 정보
  const [profile, setProfile] = useState<Profile>({
    nickname: "moviefan",
    email: "moviefan@example.com",
    introduction: "영화를 좋아하는 UMC 회원입니다.",
  });

  return (
    <BrowserRouter>
      <div style={{ padding: "20px" }}>
        <h1>UMC 영화 서비스</h1>

        <nav style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <Link to="/">영화 목록</Link>
          <Link to="/search">영화 검색</Link>
          <Link to="/movies/550">영화 상세</Link>
          <Link to="/signup">회원가입</Link>
          <Link to="/login">로그인</Link>
          <Link to="/mypage">마이페이지</Link>
        </nav>

        <Routes>
          <Route path="/" element={<MovieListPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/mypage"
            element={<MyPage profile={profile} />}
          />

          <Route
            path="/mypage/edit"
            element={
              <EditProfilePage
                profile={profile}
                onSave={setProfile}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
