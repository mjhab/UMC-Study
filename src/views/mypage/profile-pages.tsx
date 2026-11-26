
"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import FavoritesList from "../../components/movies/favorites-list";
import { getMe } from "../../api/members/me";
import { useAuthStore } from "../../stores/auth-store";
import { useUpdateMeMutation } from "../../hooks/use-update-me-mutation";

// 로그인한 회원의 정보를 조회하는 Hook
function useMeQuery() {
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

  return { accessToken, meQuery };
}

// 내 정보 조회 화면
export function MyPage() {
  const { accessToken, meQuery } = useMeQuery();

  if (!accessToken) {
    return (
      <div style={containerStyle}>
        <h2>내 정보</h2>
        <p>로그인이 필요합니다.</p>
        <Link href="/login">로그인하기</Link>
      </div>
    );
  }

  if (meQuery.isLoading) {
    return (
      <div style={containerStyle}>
        <p>회원 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (meQuery.isError || !meQuery.data) {
    return (
      <div style={containerStyle}>
        <p>회원 정보를 불러오지 못했습니다.</p>
      </div>
    );
  }

  const profile = meQuery.data;

  return (
    <div style={containerStyle}>
      <h2>내 정보</h2>

      <div style={avatarStyle}>👤</div>

      <div style={fieldStyle}>
        <strong>닉네임</strong>
        <p>{profile.nickname}</p>
      </div>

      <div style={fieldStyle}>
        <strong>이메일</strong>
        <p>{profile.email}</p>
      </div>

      <div style={fieldStyle}>
        <strong>가입일</strong>
        <p>
          {new Date(profile.createdAt).toLocaleDateString("ko-KR")}
        </p>
      </div>

      <Link href="/mypage/edit" style={buttonStyle}>
        내 정보 수정
      </Link>

      <div style={{ marginTop: "30px" }}>
        <h3>❤️ 내 즐겨찾기 영화</h3>
        <FavoritesList />
      </div>
    </div>
  );
}

// 내 정보 수정 화면
export function EditProfilePage() {
  const { accessToken, meQuery } = useMeQuery();

  if (!accessToken) {
    return (
      <div style={containerStyle}>
        <h2>내 정보 수정</h2>
        <p>로그인이 필요합니다.</p>
        <Link href="/login">로그인하기</Link>
      </div>
    );
  }

  if (meQuery.isLoading) {
    return (
      <div style={containerStyle}>
        <p>회원 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (meQuery.isError || !meQuery.data) {
    return (
      <div style={containerStyle}>
        <p>회원 정보를 불러오지 못했습니다.</p>
      </div>
    );
  }

  return (
    <EditProfileForm
      initialNickname={meQuery.data.nickname}
      email={meQuery.data.email}
    />
  );
}

interface EditProfileFormProps {
  initialNickname: string;
  email: string;
}

// 내 정보 수정 폼
function EditProfileForm({
  initialNickname,
  email,
}: EditProfileFormProps) {
  const router = useRouter();

  const [nickname, setNickname] = useState(initialNickname);

  const updateMeMutation = useUpdateMeMutation();

  const trimmedNickname = nickname.trim();

  const isValid =
    trimmedNickname.length >= 2 &&
    trimmedNickname.length <= 12;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValid || updateMeMutation.isPending) {
      return;
    }

    updateMeMutation.mutate(
      { nickname: trimmedNickname },
      {
        onSuccess: () => {
          router.push("/mypage");
        },
      }
    );
  };

  return (
    <div style={containerStyle}>
      <h2>내 정보 수정</h2>

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label htmlFor="edit-nickname">닉네임</label>

          <input
            id="edit-nickname"
            style={inputStyle}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          {!isValid && (
            <p style={{ color: "red", fontSize: "13px" }}>
              닉네임은 2~12자로 입력해 주세요.
            </p>
          )}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="edit-email">이메일</label>

          <input
            id="edit-email"
            type="email"
            style={{
              ...inputStyle,
              backgroundColor: "#f3f4f6",
            }}
            value={email}
            readOnly
          />

          <p style={{ color: "#666", fontSize: "12px" }}>
            이메일은 변경할 수 없습니다.
          </p>
        </div>

        <button
          type="submit"
          disabled={!isValid || updateMeMutation.isPending}
          style={{
            ...buttonStyle,
            width: "100%",
            border: "none",
            backgroundColor:
              isValid && !updateMeMutation.isPending
                ? "#2563eb"
                : "#aaa",
            cursor:
              isValid && !updateMeMutation.isPending
                ? "pointer"
                : "not-allowed",
          }}
        >
          {updateMeMutation.isPending
            ? "저장 중..."
            : "저장하기"}
        </button>

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          <Link href="/mypage">취소</Link>
        </div>
      </form>
    </div>
  );
}

// 기존 디자인 스타일 유지
const containerStyle = {
  maxWidth: "450px",
  margin: "40px auto",
  padding: "30px",
  border: "1px solid #ddd",
  borderRadius: "12px",
};

const avatarStyle = {
  fontSize: "48px",
  textAlign: "center" as const,
  margin: "20px 0",
};

const fieldStyle = {
  marginBottom: "22px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  border: "1px solid #ddd",
  boxSizing: "border-box" as const,
};

const buttonStyle = {
  display: "block",
  padding: "14px",
  textAlign: "center" as const,
  borderRadius: "8px",
  backgroundColor: "#2563eb",
  color: "white",
  textDecoration: "none",
  fontSize: "15px",
};
