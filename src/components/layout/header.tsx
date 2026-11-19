
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getMe } from "../../api/members/me";
import { useAuthStore } from "../../stores/auth-store";

export default function Header() {
  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const meQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return (
    <header
      style={{
        padding: "20px 30px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Link
        to="/"
        style={{
          fontWeight: "bold",
          fontSize: "22px",
          textDecoration: "none",
          color: "#2563eb",
        }}
      >
        UMCINE
      </Link>

      {!accessToken ? (
        <Link to="/login">로그인</Link>
      ) : meQuery.isLoading ? (
        <span>로딩 중...</span>
      ) : (
        <Link to="/mypage">마이페이지</Link>      )}
    </header>
  );
}
