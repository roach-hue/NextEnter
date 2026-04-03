import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  UserProfile,
} from "../api/user";
import LeftSidebar from "../components/LeftSidebar";
import { usePageNavigation } from "../hooks/usePageNavigation";
import ChangePasswordModal from "../components/ChangePasswordModal"; // ✅ 추가
import { useKakaoAddress } from "../hooks/useKakaoAddress"; // ✅ 추가

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { activeMenu, handleMenuClick } = usePageNavigation(
    "mypage",
    "mypage-sub-2"
  );

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // ✅ 추가
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 수정 가능한 필드
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    bio: "",
    address: "", // ✅ 추가
    detailAddress: "", // ✅ 추가
  });

  // ✅ 카카오 주소 API 훅 사용
  const { openPostcode } = useKakaoAddress((data) => {
    setFormData(prev => ({ ...prev, address: data.address }));
  });

  // 프로필 정보 불러오기
  useEffect(() => {
    if (user?.userId) {
      loadProfile();
    }
  }, [user?.userId]);

  const loadProfile = async () => {
    if (!user?.userId) return;

    setIsLoading(true);
    try {
      const response = await getUserProfile(user.userId);
      if (response.success && response.data) {
        setProfile(response.data);
        setFormData({
          name: response.data.name || "",
          phone: response.data.phone || "",
          age: response.data.age?.toString() || "",
          gender: response.data.gender || "",
          bio: response.data.bio || "",
          address: response.data.address || "", // ✅ 추가
          detailAddress: response.data.detailAddress || "", // ✅ 추가
        });
      }
    } catch (err: any) {
      console.error("프로필 로드 오류:", err);
      setError("프로필 정보를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 프로필 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;

    const file = e.target.files?.[0];
    if (!file || !user?.userId) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await uploadProfileImage(user.userId, file);
      if (response.success && response.data) {
        setProfile((prev) =>
          prev ? { ...prev, profileImage: response.data!.profileImage } : null
        );
        setSuccessMessage("프로필 이미지가 업데이트되었습니다.");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err: any) {
      console.error("이미지 업로드 오류:", err);
      setError("이미지 업로드에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 정보 수정 저장
  const handleSave = async () => {
    if (!user?.userId) return;

    setIsLoading(true);
    setError("");

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        bio: formData.bio || undefined,
        address: formData.address || undefined, // ✅ 추가
        detailAddress: formData.detailAddress || undefined, // ✅ 추가
      };

      const response = await updateUserProfile(user.userId, updateData);
      if (response.success && response.data) {
        setProfile(response.data);
        setIsEditing(false);
        setSuccessMessage("정보가 성공적으로 수정되었습니다.");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err: any) {
      console.error("프로필 수정 오류:", err);
      setError(err.response?.data?.message || "정보 수정에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "",
        bio: profile.bio || "",
        address: profile.address || "", // ✅ 추가
        detailAddress: profile.detailAddress || "", // ✅ 추가
      });
    }
    setIsEditing(false);
    setError("");
  };

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  // ✅ 소셜 로그인 사용자 여부 확인
  const isSocialLogin = profile?.provider && profile.provider !== "LOCAL";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold">내 정보</h1>

        <div className="flex gap-6">
          {/* 왼쪽 사이드바 */}
          <LeftSidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />

          {/* 메인 컨텐츠 */}
          <div className="flex-1">
            {/* 상단 버튼 */}
            <div className="flex justify-end mb-6">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  수정하기
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-6 py-2 text-gray-700 transition bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? "저장 중..." : "저장"}
                  </button>
                </div>
              )}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 성공 메시지 */}
            {successMessage && (
              <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            {/* 프로필 카드 */}
            <div className="p-8 bg-white border-2 border-gray-200 shadow-lg rounded-2xl">
              {/* 프로필 이미지 */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 overflow-hidden bg-gray-200 rounded-full">
                    {profile?.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt="프로필"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <svg
                          className="w-16 h-16 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="absolute bottom-0 right-0 p-2 text-white transition bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={!isEditing}
                  />
                </div>

                {isEditing && (
                  <p className="mt-4 text-sm text-gray-500">
                    클릭하여 프로필 이미지 변경 (최대 5MB)
                  </p>
                )}
              </div>

              {/* 정보 입력 필드 */}
              <div className="space-y-6">
                {/* 이름 */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing || isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* 이메일 (읽기 전용) */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full px-4 py-3 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    이메일은 변경할 수 없습니다
                  </p>
                </div>

                {/* 전화번호 */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing || isLoading}
                    placeholder="010-1234-5678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* 나이 */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    나이
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    disabled={!isEditing || isLoading}
                    min="1"
                    max="120"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* 성별 */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    성별
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    disabled={!isEditing || isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">선택 안함</option>
                    <option value="MALE">남성</option>
                    <option value="FEMALE">여성</option>
                    <option value="OTHER">기타</option>
                  </select>
                </div>

                {/* 자기소개 */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    자기소개
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    disabled={!isEditing || isLoading}
                    rows={4}
                    placeholder="자기소개를 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* ✅ 주소 */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    주소
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={formData.address}
                      readOnly
                      placeholder="주소 찾기 버튼을 클릭하세요"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg cursor-not-allowed bg-gray-50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={openPostcode}
                      disabled={!isEditing || isLoading}
                      className="px-4 py-3 text-sm font-medium text-white transition bg-gray-600 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      주소 찾기
                    </button>
                  </div>
                </div>

                {/* ✅ 상세 주소 */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    상세 주소
                  </label>
                  <input
                    type="text"
                    value={formData.detailAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, detailAddress: e.target.value })
                    }
                    disabled={!isEditing || isLoading}
                    placeholder="상세 주소를 입력하세요 (예: 3층)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* 가입 정보 */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    계정 정보
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {profile?.provider && (
                      <p>
                        <span className="font-medium">가입 방식:</span>{" "}
                        {profile.provider === "LOCAL"
                          ? "일반 가입"
                          : `${profile.provider} 소셜 로그인`}
                      </p>
                    )}
                    {profile?.createdAt && (
                      <p>
                        <span className="font-medium">가입일:</span>{" "}
                        {new Date(profile.createdAt).toLocaleDateString(
                          "ko-KR"
                        )}
                      </p>
                    )}
                  </div>

                  {/* ✅ 비밀번호 변경 버튼 - 일반 가입 사용자만 */}
                  {!isSocialLogin && (
                    <div className="mt-4">
                      <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="px-6 py-2 text-white transition bg-orange-500 rounded-lg hover:bg-orange-600"
                      >
                        비밀번호 변경
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ 비밀번호 변경 모달 */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userEmail={profile?.email || ""}
      />
    </div>
  );
}
