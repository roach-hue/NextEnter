import { useState } from "react";

interface AccountSecurityProps {
  email: string;
  managerName: string;
  setManagerName: (value: string) => void;
  managerPhone: string;
  setManagerPhone: (value: string) => void;
  managerDepartment: string;
  setManagerDepartment: (value: string) => void;
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  onChangePassword: () => void;
}

export default function AccountSecurity({
  email,
  managerName,
  setManagerName,
  managerPhone,
  setManagerPhone,
  managerDepartment,
  setManagerDepartment,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onChangePassword,
}: AccountSecurityProps) {
  // 👁️ 눈깔 상태 관리 (여기서만 씀)
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-6 text-2xl font-bold">계정 및 보안 설정</h2>
        <p className="mb-6 text-gray-600">
          로그인 정보 및 채용 담당자 개인의 연락처를 관리합니다.
        </p>
      </div>

      {/* 1. 로그인 계정 정보 */}
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="mb-4 text-lg font-bold">로그인 계정 정보</h3>
        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">
            아이디(이메일)
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">수정 불가</p>
        </div>
      </div>

      {/* 2. 채용 담당자 정보 */}
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="mb-4 text-lg font-bold">채용 담당자 정보</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">
              담당자 이름
            </label>
            <input
              type="text"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">
              담당자 연락처
            </label>
            <input
              type="tel"
              value={managerPhone}
              onChange={(e) => setManagerPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">
              담당자 부서 / 직책
            </label>
            <input
              type="text"
              value={managerDepartment}
              onChange={(e) => setManagerDepartment(e.target.value)}
              placeholder="예: 인사팀 / 채용매니저"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* 3. 비밀번호 변경 (눈깔 버튼 추가됨!) */}
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="mb-4 text-lg font-bold">비밀번호 변경</h3>
        <div className="space-y-4">
          {/* 현재 비밀번호 */}
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">
              현재 비밀번호
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호 입력"
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-purple-600"
              >
                {showCurrentPw ? (
                  // 눈 뜬 아이콘
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  // 눈 감은 아이콘
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 새 비밀번호 */}
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">
              새 비밀번호
            </label>
            <div className="relative">
              <input
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 입력"
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-purple-600"
              >
                {showNewPw ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 새 비밀번호 확인 */}
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">
              새 비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showConfirmPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 확인"
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-purple-600"
              >
                {showConfirmPw ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={onChangePassword}
            className="w-full px-6 py-3 text-white transition bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            비밀번호 변경
          </button>
        </div>
      </div>
    </div>
  );
}
