
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

export interface Profile {
  nickname: string;
  email: string;
  introduction: string;
}

interface ProfileProps {
  profile: Profile;
}

interface EditProfileProps extends ProfileProps {
  onSave: (profile: Profile) => void;
}

// 내 정보 조회 화면
export function MyPage({ profile }: ProfileProps) {
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
        <strong>자기소개</strong>
        <p>{profile.introduction || "등록된 소개가 없습니다."}</p>
      </div>

      <Link to="/mypage/edit" style={buttonStyle}>
        내 정보 수정
      </Link>
    </div>
  );
}

// 내 정보 수정 화면
export function EditProfilePage({
  profile,
  onSave,
}: EditProfileProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState(profile);

  const isValid =
    form.nickname.trim().length >= 2 &&
    form.nickname.trim().length <= 12 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;

    onSave({
      nickname: form.nickname.trim(),
      email: form.email.trim(),
      introduction: form.introduction,
    });

    alert("내 정보가 수정되었습니다.");
    navigate("/mypage");
  };

  return (
    <div style={containerStyle}>
      <h2>내 정보 수정</h2>

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label>닉네임</label>
          <input
            style={inputStyle}
            value={form.nickname}
            onChange={(e) =>
              setForm({ ...form, nickname: e.target.value })
            }
          />
          {form.nickname.trim().length < 2 ||
          form.nickname.trim().length > 12 ? (
            <p style={{ color: "red", fontSize: "13px" }}>
              닉네임은 2~12자로 입력해 주세요.
            </p>
          ) : null}
        </div>

        <div style={fieldStyle}>
          <label>이메일</label>
          <input
            type="email"
            style={inputStyle}
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </div>

        <div style={fieldStyle}>
          <label>자기소개</label>
          <textarea
            style={{ ...inputStyle, minHeight: "100px" }}
            value={form.introduction}
            onChange={(e) =>
              setForm({ ...form, introduction: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          disabled={!isValid}
          style={{
            ...buttonStyle,
            width: "100%",
            border: "none",
            backgroundColor: isValid ? "#2563eb" : "#aaa",
            cursor: isValid ? "pointer" : "not-allowed",
          }}
        >
          저장하기
        </button>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/mypage">취소</Link>
        </div>
      </form>
    </div>
  );
}

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
  borderRadius: "8px",
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
