
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import Header from "./components/layout/header";
import ProtectedLayout from "./routes/protected-layout";
import { useAuthStore } from "./stores/auth-store";

import MovieListPage from "./views/movies/movie-list-page";
import MovieDetailPage from "./views/movies/movie-detail-page";
import SearchPage from "./views/movies/search-page";

import SignupPage from "./views/auth/signup-page";
import LoginPage from "./views/auth/login-page";

import {
  MyPage,
  EditProfilePage,
} from "./views/mypage/profile-pages";

// 로그인된 사용자는 로그인 페이지 대신 홈으로 이동
function LoginRoute() {
  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Header />

      <div style={{ padding: "20px" }}>
        <h1>UMC 영화 서비스</h1>

        <nav
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <Link to="/">영화 목록</Link>
          <Link to="/search">영화 검색</Link>
          <Link to="/movies/550">영화 상세</Link>
          <Link to="/signup">회원가입</Link>
        </nav>

        <Routes>
          {/* 로그인 없이 접근 가능한 페이지 */}
          <Route path="/" element={<MovieListPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="/movies/:id"
            element={<MovieDetailPage />}
          />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginRoute />} />

          {/* 로그인한 사용자만 접근 가능한 페이지 */}
          <Route element={<ProtectedLayout />}>
            <Route path="/mypage" element={<MyPage />} />
            <Route
              path="/mypage/edit"
              element={<EditProfilePage />}
            />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
