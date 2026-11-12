
import { useState, type FormEvent } from "react";
import { checkEmailDuplicate } from "../../api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "../../api/members/check-nickname-duplicate";
import { signup } from "../../api/members/signup";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

const DEFAULT_FORM = {
  email: "",
  nickname: "",
  password: "",
  passwordConfirm: "",
};

const DEFAULT_DUPLICATE_CHECK = {
  isChecking: false,
  isAvailable: false,
};

type FormKey = keyof typeof DEFAULT_FORM;
type DuplicateCheckKey = "email" | "nickname";

export default function SignupPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [duplicateCheck, setDuplicateCheck] = useState({
    email: { ...DEFAULT_DUPLICATE_CHECK },
    nickname: { ...DEFAULT_DUPLICATE_CHECK },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 입력값 검증
  const isEmailValid = EMAIL_REGEX.test(form.email.trim());
  const isNicknameValid =
    form.nickname.trim().length >= 2 &&
    form.nickname.trim().length <= 12;
  const isPasswordValid = PASSWORD_REGEX.test(form.password);
  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 &&
    form.password === form.passwordConfirm;

  const isFormValid =
    isEmailValid &&
    isNicknameValid &&
    isPasswordValid &&
    isPasswordConfirmValid;

  // 중복 확인까지 통과해야 가입 가능
  const canSubmit =
    isFormValid &&
    duplicateCheck.email.isAvailable &&
    duplicateCheck.nickname.isAvailable;

  // 입력값 변경
  const handleChange = (key: FormKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (key === "email" || key === "nickname") {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...DEFAULT_DUPLICATE_CHECK },
      }));
    }
  };

  // 이메일·닉네임 중복 확인
  const handleCheckDuplicate = async (key: DuplicateCheckKey) => {
    const isValid = key === "email" ? isEmailValid : isNicknameValid;
    if (!isValid || duplicateCheck[key].isChecking) return;

    const label = key === "email" ? "이메일" : "닉네임";

    setDuplicateCheck((prev) => ({
      ...prev,
      [key]: { isChecking: true, isAvailable: false },
    }));

    try {
      const response =
        key === "email"
          ? await checkEmailDuplicate(form.email.trim())
          : await checkNicknameDuplicate(form.nickname.trim());

      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: {
          isChecking: false,
          isAvailable: response.available,
        },
      }));

      alert(
        response.available
          ? `사용할 수 있는 ${label}이에요.`
          : `이미 사용 중인 ${label}이에요.`
      );
    } catch {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...DEFAULT_DUPLICATE_CHECK },
      }));
      alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    }
  };

  // 회원가입 요청
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await signup({
        email: form.email.trim(),
        nickname: form.nickname.trim(),
        password: form.password,
      });

      alert(response.message);
    } catch {
      alert("회원가입에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxSizing: "border-box" as const,
    marginTop: "6px",
  };

  const fieldStyle = { marginBottom: "20px" };
  const errorStyle = { color: "red", fontSize: "13px" };

  return (
    <div
      style={{
        maxWidth: "450px",
        margin: "40px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "12px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>UMC 회원가입</h2>

      <form onSubmit={handleSubmit} noValidate>
        {/* 이메일 */}
        <div style={fieldStyle}>
          <label>이메일</label>
          <input
            type="email"
            value={form.email}
            disabled={duplicateCheck.email.isChecking || isSubmitting}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="example@email.com"
            style={inputStyle}
          />
          {form.email && !isEmailValid && (
            <p style={errorStyle}>올바른 이메일 형식을 입력해 주세요.</p>
          )}
          <button
            type="button"
            disabled={!isEmailValid || duplicateCheck.email.isChecking || isSubmitting}
            onClick={() => handleCheckDuplicate("email")}
          >
            {duplicateCheck.email.isChecking ? "확인 중" : "중복 확인"}
          </button>
          {duplicateCheck.email.isAvailable && (
            <p style={{ color: "green" }}>사용 가능한 이메일입니다.</p>
          )}
        </div>

        {/* 닉네임 */}
        <div style={fieldStyle}>
          <label>닉네임</label>
          <input
            type="text"
            value={form.nickname}
            disabled={duplicateCheck.nickname.isChecking || isSubmitting}
            onChange={(e) => handleChange("nickname", e.target.value)}
            placeholder="2~12자"
            style={inputStyle}
          />
          {form.nickname && !isNicknameValid && (
            <p style={errorStyle}>닉네임은 2~12자여야 합니다.</p>
          )}
          <button
            type="button"
            disabled={!isNicknameValid || duplicateCheck.nickname.isChecking || isSubmitting}
            onClick={() => handleCheckDuplicate("nickname")}
          >
            {duplicateCheck.nickname.isChecking ? "확인 중" : "중복 확인"}
          </button>
          {duplicateCheck.nickname.isAvailable && (
            <p style={{ color: "green" }}>사용 가능한 닉네임입니다.</p>
          )}
        </div>

        {/* 비밀번호 */}
        <div style={fieldStyle}>
          <label>비밀번호</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="대소문자, 숫자, 특수문자 포함 8자 이상"
            style={inputStyle}
          />
          {form.password && !isPasswordValid && (
            <p style={errorStyle}>
              대소문자, 숫자, 특수문자를 포함해 8자 이상 입력해 주세요.
            </p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div style={fieldStyle}>
          <label>비밀번호 확인</label>
          <input
            type="password"
            value={form.passwordConfirm}
            onChange={(e) => handleChange("passwordConfirm", e.target.value)}
            placeholder="비밀번호 재입력"
            style={inputStyle}
          />
          {form.passwordConfirm && !isPasswordConfirmValid && (
            <p style={errorStyle}>비밀번호가 일치하지 않습니다.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: canSubmit ? "#2563eb" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "8px",
          }}
        >
          {isSubmitting ? "가입 중" : "가입하기"}
        </button>
      </form>
    </div>
  );
}
