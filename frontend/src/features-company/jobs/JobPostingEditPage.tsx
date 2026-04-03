import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import Footer from "../../components/Footer";
import {
  getJobPosting,
  updateJobPosting,
  type JobPostingRequest,
} from "../../api/job";
import { JOB_CATEGORIES } from "../../constants/jobConstants";

export default function JobPostingEditPage() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { isAuthenticated, user, logout } = useAuthStore();

  const [loading, setLoading] = useState(true);
  
  // 이미지 미리보기 state
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [detailImagePreview, setDetailImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    jobCategories: [] as string[], // 배열로 변경
    requiredSkills: "",
    preferredSkills: "",
    experienceMin: "",
    experienceMax: "",
    salaryMin: "",
    salaryMax: "",
    location: "",
    locationCity: "", // 시/도 정보 (필터링용)
    description: "",
    deadline: "",
  });

  // 공고 데이터 로드
  useEffect(() => {
    const loadJobPosting = async () => {
      if (!jobId) {
        alert("잘못된 접근입니다.");
        navigate("/company/jobs");
        return;
      }

      try {
        setLoading(true);
        const job = await getJobPosting(parseInt(jobId));

        setFormData({
          title: job.title,
          jobCategories: job.jobCategory.split(',').map(c => c.trim()), // 문자열을 배열로 변환
          requiredSkills: job.requiredSkills || "",
          preferredSkills: job.preferredSkills || "",
          experienceMin: job.experienceMin?.toString() || "",
          experienceMax: job.experienceMax?.toString() || "",
          salaryMin: job.salaryMin?.toString() || "",
          salaryMax: job.salaryMax?.toString() || "",
          location: job.location,
          locationCity: job.locationCity || "", // 시/도 정보 로드
          description: job.description || "",
          deadline: job.deadline,
        });
        
        // 기존 이미지 로드
        if (job.thumbnailUrl) {
          setThumbnailPreview(job.thumbnailUrl);
        }
        if (job.detailImageUrl) {
          setDetailImagePreview(job.detailImageUrl);
        }
      } catch (error: any) {
        console.error("공고 조회 실패:", error);
        alert(
          error.response?.data?.message || "공고를 불러오는데 실패했습니다.",
        );
        navigate("/company/jobs");
      } finally {
        setLoading(false);
      }
    };

    loadJobPosting();
  }, [jobId, navigate]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetailImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDetailImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 주소 검색 함수
  const handleAddressSearch = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: (data: any) => {
          // 도로명 주소 우선, 없으면 지번 주소
          const fullAddress = data.roadAddress || data.jibunAddress;
          
          // 시/도 정보 추출
          const city = data.sido; // 예: "서울특별시", "경기도" 등
          
          setFormData(prev => ({
            ...prev,
            location: fullAddress,
            locationCity: city
          }));
        },
        width: '100%',
        height: 600,
      }).open();
    } else {
      alert('주소 검색 서비스를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobId) return;

    // 필수 항목 검사
    if (!formData.title.trim()) {
      alert("공고 제목을 입력해주세요.");
      return;
    }

    if (formData.jobCategories.length === 0) {
      alert("직무 분류를 선택해주세요.");
      return;
    }

    if (!formData.location.trim()) {
      alert("근무지를 입력해주세요.");
      return;
    }

    if (!formData.deadline) {
      alert("마감일을 선택해주세요.");
      return;
    }

    // 유효성 검사
    if (formData.experienceMin && formData.experienceMax) {
      const min = parseInt(formData.experienceMin);
      const max = parseInt(formData.experienceMax);
      if (min > max) {
        alert("최소 경력이 최대 경력보다 클 수 없습니다.");
        return;
      }
    }

    if (formData.salaryMin && formData.salaryMax) {
      const min = parseInt(formData.salaryMin);
      const max = parseInt(formData.salaryMax);
      if (min > max) {
        alert("최소 연봉이 최대 연봉보다 클 수 없습니다.");
        return;
      }
    }

    // companyId 가져오기
    const companyId = user?.companyId;
    if (!companyId) {
      alert("기업 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      // API 요청 데이터 구성
      const requestData: JobPostingRequest = {
        title: formData.title,
        jobCategory: formData.jobCategories.join(', '), // 배열을 문자열로 변환
        requiredSkills: formData.requiredSkills || undefined,
        preferredSkills: formData.preferredSkills || undefined,
        experienceMin: formData.experienceMin
          ? parseInt(formData.experienceMin)
          : undefined,
        experienceMax: formData.experienceMax
          ? parseInt(formData.experienceMax)
          : undefined,
        salaryMin: formData.salaryMin
          ? parseInt(formData.salaryMin)
          : undefined,
        salaryMax: formData.salaryMax
          ? parseInt(formData.salaryMax)
          : undefined,
        location: formData.location,
        locationCity: formData.locationCity, // 시/도 정보 추가
        description: formData.description || undefined,
        thumbnailUrl: thumbnailPreview || undefined,
        detailImageUrl: detailImagePreview || undefined,
        deadline: formData.deadline,
      };

      // API 호출
      await updateJobPosting(parseInt(jobId), requestData, companyId);

      alert("공고가 성공적으로 수정되었습니다! 🎉");

      // 공고 관리 페이지로 리다이렉트
      navigate("/company/jobs");
    } catch (error: any) {
      console.error("공고 수정 실패:", error);
      alert(error.response?.data?.message || "공고 수정에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    if (window.confirm("수정 중인 내용이 사라집니다. 정말 취소하시겠습니까?")) {
      navigate("/company/jobs");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 메인 콘텐츠 */}
      <div className="px-6 py-10 mx-auto max-w-7xl">
        <div className="p-10 bg-white border border-gray-200 shadow-2xl rounded-3xl">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              {/* 왼쪽: 폼 필드 (2/3) */}
              <div className="space-y-6 lg:col-span-2">
                {/* 공고 제목 */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    공고 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="예: [신입/경력] 프론트엔드 개발자 채용"
                    maxLength={200}
                    className="w-full px-4 py-3 transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.title.length}/200자
                  </p>
                </div>

                {/* 직무 분류 - 다중 선택 */}
                <div>
                  <label className="block mb-3 text-sm font-semibold text-gray-700">
                    직무 분류 <span className="text-red-500">*</span>
                  </label>
                  
                  {/* 직무 버튼 그리드 */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {JOB_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setFormData(prev => {
                            const isSelected = prev.jobCategories.includes(category);
                            return {
                              ...prev,
                              jobCategories: isSelected
                                ? prev.jobCategories.filter(c => c !== category)
                                : [...prev.jobCategories, category]
                            };
                          });
                        }}
                        className={`px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                          formData.jobCategories.includes(category)
                            ? "bg-purple-700 text-white border-2 border-purple-700 shadow-md"
                            : "bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* 선택된 필터 */}
                  {formData.jobCategories.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-gray-700">선택된 필터</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.jobCategories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                jobCategories: prev.jobCategories.filter(c => c !== category)
                              }));
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-black-700 transition-colors bg-purple-200 rounded-full hover:bg-blue-200"
                          >
                            <span>{category}</span>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 근무지 */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    근무지 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="주소 검색 버튼을 클릭해주세요"
                      maxLength={100}
                      className="flex-1 px-4 py-3 transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                      readOnly
                      required
                    />
                    <button
                      type="button"
                      onClick={handleAddressSearch}
                      className="px-6 py-3 font-semibold text-white transition-colors bg-purple-600 rounded-xl hover:bg-purple-700 whitespace-nowrap"
                    >
                      📍 주소 검색
                    </button>
                  </div>
                  {formData.locationCity && (
                    <p className="mt-2 text-sm text-gray-600">
                      필터링 지역: <span className="font-semibold text-purple-600">{formData.locationCity}</span>
                    </p>
                  )}
                </div>

                {/* 경력 범위 */}
                <div>
                  <label className="block mb-3 text-sm font-semibold text-gray-700">
                    경력 (년)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        name="experienceMin"
                        value={formData.experienceMin}
                        onChange={handleInputChange}
                        placeholder="최소 경력 (예: 0)"
                        min="0"
                        className="w-full px-4 py-3 transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="experienceMax"
                        value={formData.experienceMax}
                        onChange={handleInputChange}
                        placeholder="최대 경력 (예: 5)"
                        min="0"
                        className="w-full px-4 py-3 transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    * 신입의 경우 최소 0년, 경력무관의 경우 비워두세요
                  </p>
                </div>

                {/* 연봉 범위 */}
                <div>
                  <label className="block mb-3 text-sm font-semibold text-gray-700">
                    연봉 (만원)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        name="salaryMin"
                        value={formData.salaryMin}
                        onChange={handleInputChange}
                        placeholder="최소 연봉 (예: 3000)"
                        min="0"
                        step="100"
                        className="w-full px-4 py-3 transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="salaryMax"
                        value={formData.salaryMax}
                        onChange={handleInputChange}
                        placeholder="최대 연봉 (예: 5000)"
                        min="0"
                        step="100"
                        className="w-full px-4 py-3 transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    * 연봉 협의시 비워두세요
                  </p>
                </div>

                {/* 필수 스킬 */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    필수 스킬
                  </label>
                  <textarea
                    name="requiredSkills"
                    value={formData.requiredSkills}
                    onChange={handleInputChange}
                    placeholder="예:&#10;- React, TypeScript 실무 경험&#10;- RESTful API 설계 및 구현 경험&#10;- Git을 활용한 협업 경험"
                    rows={4}
                    className="w-full px-4 py-3 transition-colors border-2 border-gray-200 resize-none rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 우대 스킬 */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    우대 스킬
                  </label>
                  <textarea
                    name="preferredSkills"
                    value={formData.preferredSkills}
                    onChange={handleInputChange}
                    placeholder="예:&#10;- Next.js 프레임워크 사용 경험&#10;- AWS 등 클라우드 서비스 경험&#10;- 오픈소스 프로젝트 기여 경험"
                    rows={4}
                    className="w-full px-4 py-3 transition-colors border-2 border-gray-200 resize-none rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 상세 설명 */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    상세 설명
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="담당 업무, 근무 환경, 복리후생 등 상세한 내용을 작성해주세요."
                    rows={8}
                    className="w-full px-4 py-3 transition-colors border-2 border-gray-200 resize-none rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 마감일 */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    마감일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 transition-colors border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* 오른쪽: 이미지 업로드 (1/3) */}
              <div className="space-y-6 lg:col-span-1">
                {/* 썸네일 이미지 */}
                <div>
                  <label className="block mb-3 text-sm font-semibold text-gray-700">
                    썸네일 이미지
                  </label>
                  <div
                    onClick={() =>
                      document.getElementById("thumbnailInput")?.click()
                    }
                    className={`relative w-full h-48 border-3 ${
                      thumbnailPreview
                        ? "border-blue-500 border-solid"
                        : "border-dashed border-gray-300"
                    } rounded-2xl cursor-pointer hover:border-blue-400 transition-all overflow-hidden group ${
                      !thumbnailPreview ? "bg-gray-50" : ""
                    }`}
                  >
                    {thumbnailPreview ? (
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail Preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center justify-center w-12 h-12 text-2xl text-white bg-blue-500 rounded-full shadow-lg">
                          🖼️
                        </div>
                        <div className="text-center">
                          <div className="mb-1 text-sm font-semibold text-gray-700">
                            썸네일 추가
                          </div>
                          <div className="text-xs text-gray-500">
                            목록에 표시될 이미지
                          </div>
                        </div>
                      </div>
                    )}
                    <input
                      id="thumbnailInput"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* 상세 홍보 이미지 */}
                <div>
                  <label className="block mb-3 text-sm font-semibold text-gray-700">
                    상세 홍보 이미지
                  </label>
                  <div
                    onClick={() =>
                      document.getElementById("detailImageInput")?.click()
                    }
                    className={`relative w-full h-64 border-3 ${
                      detailImagePreview
                        ? "border-purple-500 border-solid"
                        : "border-dashed border-gray-300"
                    } rounded-2xl cursor-pointer hover:border-purple-400 transition-all overflow-hidden group ${
                      !detailImagePreview ? "bg-gray-50" : ""
                    }`}
                  >
                    {detailImagePreview ? (
                      <img
                        src={detailImagePreview}
                        alt="Detail Image Preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="flex items-center justify-center w-16 h-16 text-3xl text-white bg-purple-500 rounded-full shadow-lg">
                          📋
                        </div>
                        <div className="text-center">
                          <div className="mb-1 text-base font-semibold text-gray-700">
                            상세 이미지 추가
                          </div>
                          <div className="text-sm text-gray-500">
                            상세 페이지에 표시될 포스터
                          </div>
                        </div>
                      </div>
                    )}
                    <input
                      id="detailImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleDetailImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="flex gap-4 pt-8 mt-10 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-8 py-4 font-semibold text-gray-700 transition-colors bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-8 py-4 font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl hover:shadow-xl hover:from-purple-700 hover:to-purple-800"
              >
                수정 완료
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
