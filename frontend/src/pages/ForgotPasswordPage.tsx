import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { sendPasswordChangeCode, changePassword } from "../api/user";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1); // 1: 이메일 입력, 2: 인증코드 및 비밀번호 입력
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 타이머 시작
  const startCountdown = () => {
    setCountdown(600); // 10분 = 600초
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 인증코드 발송
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await sendPasswordChangeCode(email);

      if (response.success) {
        alert("인증코드가 이메일로 발송되었습니다.");
        setStep(2);
        startCountdown();
      } else {
        setError(response.message || "인증코드 발송에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("인증코드 발송 오류:", err);
      setError(
        err.response?.data?.message || "인증코드 발송 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!verificationCode) {
      setError("인증코드를 입력해주세요.");
      return;
    }

    if (!newPassword) {
      setError("새 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword.length < 4) {
      setError("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await changePassword({
        email,
        verificationCode,
        newPassword,
      });

      if (response.success) {
        alert("비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.");
        navigate("/user/login");
      } else {
        setError(response.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("비밀번호 변경 오류:", err);
      setError(
        err.response?.data?.message || "비밀번호 변경 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 시간 포맷팅 (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 메인 컨텐츠 */}
      <div
        className="flex-1 flex flex-col items-center px-4 pt-18 pb-4 gap-6"
        style={{ paddingTop: "4.5rem" }}
      >
        {/* 로고가 들어갈 이미지 위치 */}
        <div className="w-full max-w-lg h-48 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white">
          <p className="text-gray-500 text-lg">로고가 들어갈 이미지 위치</p>
        </div>

        {/* 가로 배치: 이미지 슬라이드 배너 + 비밀번호 찾기 폼 */}
        <div className="w-full max-w-6xl flex items-center justify-center gap-12">
          {/* 왼쪽: 이미지 슬라이드 배너 생성 위치 */}
          <div className="flex-1 max-w-lg h-96 border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center bg-white p-6">
            <p className="text-gray-700 text-base font-medium mb-2">
              이미지 슬라이드 배너
            </p>
            <p className="text-gray-500 text-sm">생성 위치</p>
            <p className="text-gray-400 text-xs mt-2">
              (회색 박스로 공간 표시만 할 것)
            </p>
          </div>

          {/* 오른쪽: 비밀번호 찾기 폼 */}
          <div className="w-full max-w-xs">
            {/* 제목 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              비밀번호 찾기
            </h2>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {step === 1 ? (
              // Step 1: 이메일 입력 및 인증코드 발송
              <form onSubmit={handleSendCode} className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  가입하신 이메일 주소를 입력하시면 비밀번호 재설정을 위한
                  인증코드를 보내드립니다.
                </p>

                {/* 이메일 입력 */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm disabled:bg-gray-100"
                  />
                </div>

                {/* 인증코드 발송 버튼 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? "발송 중..." : "인증코드 발송"}
                </button>

                {/* 하단 링크 */}
                <div className="flex items-center justify-center space-x-3 mt-6 text-xs text-gray-600">
                  <button
                    type="button"
                    onClick={() => navigate("/user/login")}
                    className="hover:text-blue-600 transition"
                  >
                    로그인
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => navigate("/user/signup")}
                    className="text-blue-600 hover:text-blue-700 transition"
                  >
                    회원가입
                  </button>
                </div>
              </form>
            ) : (
              // Step 2: 인증코드 및 새 비밀번호 입력
              <form onSubmit={handleChangePassword} className="space-y-3">
                {/* 이메일 (읽기 전용) */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm"
                  />
                </div>

                {/* 인증코드 입력 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-gray-600">
                      인증코드 6자리
                    </label>
                    {countdown > 0 ? (
                      <span className="text-xs text-orange-500 font-medium">
                        {formatTime(countdown)}
                      </span>
                    ) : (
                      <span className="text-xs text-red-500 font-medium">
                        인증코드가 만료되었습니다
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="인증코드 6자리"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      disabled={isLoading || countdown === 0}
                      maxLength={6}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* 새 비밀번호 입력 */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="새 비밀번호 (최소 4자)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading || countdown === 0}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm disabled:bg-gray-100"
                  />
                </div>

                {/* 새 비밀번호 확인 */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="새 비밀번호 확인"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    disabled={isLoading || countdown === 0}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-400 text-sm disabled:bg-gray-100"
                  />
                </div>

                {/* 비밀번호 일치 여부 표시 */}
                {newPassword && newPasswordConfirm && (
                  <div className="text-xs">
                    {newPassword === newPasswordConfirm ? (
                      <p className="text-green-500">✓ 비밀번호가 일치합니다</p>
                    ) : (
                      <p className="text-red-500">
                        ✗ 비밀번호가 일치하지 않습니다
                      </p>
                    )}
                  </div>
                )}

                {/* 비밀번호 변경 버튼 */}
                <button
                  type="submit"
                  disabled={isLoading || countdown === 0}
                  className="w-full py-3 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? "변경 중..." : "비밀번호 변경"}
                </button>

                {/* 하단 버튼 */}
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setVerificationCode("");
                      setNewPassword("");
                      setNewPasswordConfirm("");
                      setError("");
                      setCountdown(0);
                    }}
                    disabled={isLoading}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/user/login")}
                    disabled={isLoading}
                    className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    로그인으로
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
