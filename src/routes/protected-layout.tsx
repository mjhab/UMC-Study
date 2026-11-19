
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/auth-store";

export default function ProtectedLayout() {
  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  // 로그인 토큰이 없으면 로그인 페이지로 이동
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // 로그인 상태라면 하위 페이지 표시
  return <Outlet />;
}
