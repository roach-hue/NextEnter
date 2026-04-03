import { useState } from "react";
import { sendPasswordChangeCode, changePassword } from "../api/user";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  userEmail,
}: ChangePasswordModalProps) {
  const [step, setStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState(userEmail);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
  const handleSendCode = async () => {
    setError("");

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await sendPasswordChangeCode(email);

      if (response.success) {
        alert("인증코드가 이메일로 발송되었습니다.");
        setStep("verify");
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
  const handleChangePassword = async () => {
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
        alert("비밀번호가 변경되었습니다.");
        handleClose();
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

  // 모달 닫기
  const handleClose = () => {
    setStep("email");
    setEmail(userEmail);
    setVerificationCode("");
    setNewPassword("");
    setNewPasswordConfirm("");
    setError("");
    setCountdown(0);
    onClose();
  };

  // 시간 포맷팅 (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">비밀번호 변경</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {step === "email" ? (
          // Step 1: 이메일 입력 및 인증코드 발송
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 인증
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSendCode}
                disabled={isLoading}
                className="flex-1 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition disabled:bg-gray-400"
              >
                {isLoading ? "발송 중..." : "인증"}
              </button>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition disabled:bg-gray-200"
              >
                취소
              </button>
            </div>
          </>
        ) : (
          // Step 2: 인증코드 입력 및 새 비밀번호 설정
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 인증
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                이메일은 변경할 수 없습니다
              </p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  인증 코드 6자리
                </label>
                {countdown > 0 && (
                  <span className="text-sm text-orange-500 font-medium">
                    {formatTime(countdown)}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isLoading}
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                placeholder="인증코드 6자리를 입력하세요"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                변경 비밀번호
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                placeholder="새로운 비밀번호를 입력하세요"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                새 비밀번호
              </label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                placeholder="새 비밀번호를 다시 입력하세요"
              />
              {newPassword &&
                newPasswordConfirm &&
                newPassword === newPasswordConfirm && (
                  <p className="text-xs text-green-500 mt-1">
                    ✓ 비밀번호가 일치합니다
                  </p>
                )}
              {newPassword &&
                newPasswordConfirm &&
                newPassword !== newPasswordConfirm && (
                  <p className="text-xs text-red-500 mt-1">
                    ✗ 비밀번호가 일치하지 않습니다
                  </p>
                )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleChangePassword}
                disabled={isLoading || countdown === 0}
                className="flex-1 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition disabled:bg-gray-400"
              >
                {isLoading ? "변경 중..." : "변경"}
              </button>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition disabled:bg-gray-200"
              >
                취소
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
