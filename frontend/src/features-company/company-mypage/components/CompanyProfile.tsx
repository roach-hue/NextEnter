import { useState } from "react";
import { useKakaoAddress } from "../../../hooks/useKakaoAddress";

interface CompanyProfileProps {
  loading: boolean;
  companyLogo: string;
  setCompanyLogo: (value: string) => void;
  companyName: string;
  ceoName: string;
  setCeoName: (value: string) => void;
  businessNumber: string;
  description: string;
  setDescription: (value: string) => void;
  shortIntro: string;
  setShortIntro: (value: string) => void;
  website: string;
  setWebsite: (value: string) => void;
  snsUrl: string;
  setSnsUrl: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  companySize: string;
  setCompanySize: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  detailAddress: string;
  setDetailAddress: (value: string) => void;
  onSave: () => void;
}

export default function CompanyProfile({
  loading,
  companyLogo,
  setCompanyLogo,
  companyName,
  ceoName,
  setCeoName,
  businessNumber,
  description,
  setDescription,
  shortIntro,
  setShortIntro,
  website,
  setWebsite,
  snsUrl,
  setSnsUrl,
  industry,
  setIndustry,
  companySize,
  setCompanySize,
  address,
  setAddress,
  detailAddress,
  setDetailAddress,
  onSave,
}: CompanyProfileProps) {
  // 수정 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);

  // 카카오 주소 API 훅 사용
  const { openPostcode } = useKakaoAddress((data) => {
    setAddress(data.address);
  });

  // 취소 버튼 클릭
  const handleCancel = () => {
    setIsEditMode(false);
  };

  // 저장 버튼 클릭
  const handleSave = () => {
    onSave();
    setIsEditMode(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 상세보기 모드 렌더링
  if (!isEditMode) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold">기업 정보</h2>
            <p className="text-gray-600">
              구직자들에게 보여지는 우리 회사의 공적인 정보입니다.
            </p>
          </div>
          <button
            onClick={() => setIsEditMode(true)}
            className="px-6 py-3 text-white transition bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            수정하기
          </button>
        </div>

        {/* 회사 로고 */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <label className="block mb-3 text-sm font-bold text-gray-700">
            회사 로고
          </label>
          <div className="flex items-center justify-center w-32 h-32 overflow-hidden bg-white border-2 border-gray-300 rounded-lg">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt="회사 로고"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-4xl">🏢</span>
            )}
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block mb-2 text-sm font-bold text-gray-500">
              회사명
            </label>
            <p className="text-lg font-semibold text-gray-900">{companyName || '-'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block mb-2 text-sm font-bold text-gray-500">
              대표자명
            </label>
            <p className="text-lg font-semibold text-gray-900">{ceoName || '-'}</p>
          </div>

          <div className="col-span-2 p-4 bg-gray-50 rounded-xl">
            <label className="block mb-2 text-sm font-bold text-gray-500">
              사업자등록번호
            </label>
            <p className="text-lg font-semibold text-gray-900">{businessNumber || '-'}</p>
          </div>
        </div>

        {/* 기업 소개 */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <label className="block mb-3 text-sm font-bold text-gray-700">
            기업 상세 소개
          </label>
          <p className="text-gray-900 whitespace-pre-wrap">{description || '등록된 소개가 없습니다.'}</p>
        </div>

        <div className="p-6 bg-gray-50 rounded-xl">
          <label className="block mb-3 text-sm font-bold text-gray-700">
            기업 한 줄 소개
          </label>
          <p className="text-gray-900">{shortIntro || '등록된 소개가 없습니다.'}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block mb-2 text-sm font-bold text-gray-500">
              홈페이지 URL
            </label>
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {website}
              </a>
            ) : (
              <p className="text-gray-900">-</p>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block mb-2 text-sm font-bold text-gray-500">
              SNS / 채용 사이트 URL
            </label>
            {snsUrl ? (
              <a
                href={snsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {snsUrl}
              </a>
            ) : (
              <p className="text-gray-900">-</p>
            )}
          </div>
        </div>

        {/* 기업 분류 정보 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block mb-2 text-sm font-bold text-gray-500">
              주요 산업군
            </label>
            <p className="text-lg font-semibold text-gray-900">{industry || '-'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block mb-2 text-sm font-bold text-gray-500">
              기업 규모
            </label>
            <p className="text-lg font-semibold text-gray-900">{companySize || '-'}</p>
          </div>
        </div>

        {/* 회사 주소 */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <label className="block mb-3 text-sm font-bold text-gray-700">
            회사 주소
          </label>
          <p className="mb-1 text-gray-900">{address || '-'}</p>
          {detailAddress && (
            <p className="text-gray-600">{detailAddress}</p>
          )}
        </div>
      </div>
    );
  }

  // 수정 모드 렌더링
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-6 text-2xl font-bold">기업 정보 수정</h2>
        <p className="mb-6 text-gray-600">
          구직자들에게 보여지는 우리 회사의 공적인 정보를 수정합니다.
        </p>
      </div>

      {/* 회사 로고 */}
      <div>
        <label className="block mb-3 text-sm font-bold text-gray-700">
          회사 로고
        </label>
        <div className="flex items-center gap-6">
          <div className="flex items-center justify-center w-32 h-32 overflow-hidden bg-gray-100 border-2 border-gray-300 rounded-lg">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt="회사 로고"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-4xl">🏢</span>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="px-6 py-2 text-white transition bg-purple-600 rounded-lg cursor-pointer hover:bg-purple-700"
            >
              이미지 변경
            </label>
            <p className="mt-2 text-sm text-gray-500">
              권장 크기: 200x200px, 최대 5MB
            </p>
          </div>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">
            회사명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={companyName}
            disabled
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">수정 불가</p>
        </div>

        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">
            대표자명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={ceoName}
            onChange={(e) => setCeoName(e.target.value)}
            placeholder="대표자명을 입력하세요"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block mb-2 text-sm font-bold text-gray-700">
            사업자등록번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={businessNumber}
            disabled
            className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">수정 불가</p>
        </div>
      </div>

      {/* 기업 소개 */}
      <div>
        <label className="block mb-2 text-sm font-bold text-gray-700">
          기업 상세 소개
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="회사에 대해 소개해주세요"
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-bold text-gray-700">
          기업 한 줄 소개
        </label>
        <input
          type="text"
          value={shortIntro}
          onChange={(e) => setShortIntro(e.target.value)}
          placeholder="기업을 한 줄로 소개해주세요"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">
            홈페이지 URL
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://www.example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">
            SNS / 채용 사이트 URL
          </label>
          <input
            type="text"
            value={snsUrl}
            onChange={(e) => setSnsUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* 기업 분류 정보 */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">
            주요 산업군
          </label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          >
            <option value="">선택해주세요</option>
            <option value="IT/소프트웨어">IT/소프트웨어</option>
            <option value="제조/생산">제조/생산</option>
            <option value="금융/보험">금융/보험</option>
            <option value="서비스">서비스</option>
            <option value="유통/물류">유통/물류</option>
            <option value="교육">교육</option>
            <option value="의료/제약">의료/제약</option>
            <option value="건설/부동산">건설/부동산</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-bold text-gray-700">
            기업 규모
          </label>
          <select
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          >
            <option value="">선택해주세요</option>
            <option value="1-10명">1-10명</option>
            <option value="11-50명">11-50명</option>
            <option value="51-200명">51-200명</option>
            <option value="201-500명">201-500명</option>
            <option value="501-1000명">501-1000명</option>
            <option value="1000명 이상">1000명 이상</option>
          </select>
        </div>
      </div>

      {/* 회사 주소 */}
      <div>
        <label className="block mb-2 text-sm font-bold text-gray-700">
          회사 주소
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={address}
            readOnly
            placeholder="주소 찾기 버튼을 클릭하세요"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg cursor-not-allowed bg-gray-50"
          />
          <button
            onClick={openPostcode}
            type="button"
            className="px-6 py-3 text-white transition bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            주소 찾기
          </button>
        </div>
        <input
          type="text"
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
          placeholder="상세 주소를 입력하세요 (예: 3층)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          onClick={handleCancel}
          type="button"
          className="px-8 py-3 text-lg font-bold text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3 text-lg font-bold text-white transition bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
}
