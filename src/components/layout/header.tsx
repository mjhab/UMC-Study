
"use client";

import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { getMe } from "../../api/members/me";
import { useAuthStore } from "../../stores/auth-store";

// 서버에서는 false, 브라우저 준비 후에는 true
function subscribe() {
  return () => {};
}

export default function Header() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const meQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    enabled: mounted && Boolean(accessToken),
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
        gap: "20px",
        flexWrap: "wrap",
      }}
    >
      <Link
        href="/"
        style={{
          fontWeight: "bold",
          fontSize: "22px",
          textDecoration: "none",
          color: "#2563eb",
        }}
      >
        UMCINE
      </Link>

      <nav
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <Link href="/">영화 목록</Link>
        <Link href="/search">영화 검색</Link>
        <Link href="/movies/550">영화 상세</Link>
        <Link href="/signup">회원가입</Link>
      </nav>

      <div>
        {!mounted ? (
          <span>확인 중...</span>
        ) : !accessToken ? (
          <Link href="/login">로그인</Link>
        ) : meQuery.isLoading ? (
          <span>로딩 중...</span>
        ) : (
          <Link href="/mypage">마이페이지</Link>
        )}
      </div>
    </header>
  );
}
