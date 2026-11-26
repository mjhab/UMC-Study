"use client";
import { useLoginMutation } from "../../hooks/use-login-mutation";
import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLoginMutation();

  const isFormValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    password.length > 0;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid || loginMutation.isPending) return;

    loginMutation.mutate({
      email: email.trim(),
      password,
    });
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxSizing: "border-box" as const,
  };

  return (
    <div
      style={{
        maxWidth: "450px",
        margin: "50px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "12px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        UMC 로그인
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="login-email">이메일</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="login-password">비밀번호</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loginMutation.isPending}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor:
              isFormValid && !loginMutation.isPending
                ? "#2563eb"
                : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor:
              isFormValid && !loginMutation.isPending
                ? "pointer"
                : "not-allowed",
          }}
        >
          {loginMutation.isPending ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "20px" }}>
        아직 계정이 없으신가요?{" "}
        <Link href="/signup">회원가입</Link>
      </p>
    </div>
  );
}
