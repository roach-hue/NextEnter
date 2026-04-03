import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import CompanyLeftSidebar from "../components/CompanyLeftSidebar";
import { useCompanyPageNavigation } from "../hooks/useCompanyPageNavigation";
import {
  getApplyDetail,
  updateApplyStatus,
  type ApplyDetailResponse,
} from "../../api/apply";
import { createInterviewOffer } from "../../api/interviewOffer";
import api from "../../api/axios";

type ResumeResponse = any;

export default function ApplicantDetailPage() {
  const navigate = useNavigate();
  const { applicantId } = useParams();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();

  const reloadParam = searchParams.get("reload");

  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState<ApplyDetailResponse | null>(null);
  const [resume, setResume] = useState<ResumeResponse | null>(null);

  // 면접 제안 전송 로딩 상태
  const [isSendingOffer, setIsSendingOffer] = useState(false);

  const { activeMenu, handleMenuClick } = useCompanyPageNavigation(
    "applicants",
    "applicants-sub-1",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadApplicantDetail = async () => {
      if (!applicantId || !user?.companyId) {
        alert("잘못된 접근입니다.");
        navigate("/company/applicants");
        return;
      }

      try {
        setLoading(true);
        const data = await getApplyDetail(
          parseInt(applicantId),
          user.companyId,
        );
        setApplicant(data);
      } catch (error: any) {
        console.error("지원자 상세 조회 실패:", error);
        alert(
          error.response?.data?.message ||
            "지원자 정보를 불러오는데 실패했습니다.",
        );
        navigate("/company/applicants");
      } finally {
        setLoading(false);
      }
    };

    loadApplicantDetail();
  }, [applicantId, user, navigate, reloadParam]);

  useEffect(() => {
    const loadResume = async () => {
      if (!user?.userId || !applicant?.resumeId) return;

      try {
        const res = await api.get(`/api/resume/public/${applicant.resumeId}`, {
          headers: {
            userId: user.userId.toString(),
          },
        });
        setResume(res.data);
      } catch (err) {
        console.error("지원자 이력서(public) 조회 실패:", err);
        setResume(null);
      }
    };

    loadResume();
  }, [applicant?.resumeId, user?.userId]);

  const handleBackClick = () => {
    navigate("/company/applicants");
  };

  const handleCompatibilityClick = () => {
    navigate(`/company/applicants/${applicantId}/compatibility`);
  };

  // ✅ [수정] 합격 처리: ACCEPTED -> PASSED 로 변경
  const handleAccept = async () => {
    if (!applicant || !user?.companyId) return;
    if (applicant.finalStatus === "PASSED") return; // PASSED 체크

    if (window.confirm(`${applicant.userName}님을 합격 처리하시겠습니까?`)) {
      try {
        // 1. API 호출 (PASSED로 전송)
        await updateApplyStatus(applicant.applyId, user.companyId, {
          status: "PASSED",
        });

        alert("합격 처리되었습니다.");

        // 2. 화면 강제 갱신 (PASSED로 설정)
        setApplicant((prev) =>
          prev ? { ...prev, finalStatus: "PASSED" } : null,
        );
      } catch (error: any) {
        console.error("상태 변경 실패:", error);
        alert(error.response?.data?.message || "상태 변경에 실패했습니다.");
      }
    }
  };

  // ✅ [수정] 불합격 처리
  const handleReject = async () => {
    if (!applicant || !user?.companyId) return;
    if (applicant.finalStatus === "REJECTED") return;

    if (window.confirm(`${applicant.userName}님을 불합격 처리하시겠습니까?`)) {
      try {
        await updateApplyStatus(applicant.applyId, user.companyId, {
          status: "REJECTED",
        });

        alert("불합격 처리되었습니다.");

        setApplicant((prev) =>
          prev ? { ...prev, finalStatus: "REJECTED" } : null,
        );
      } catch (error: any) {
        console.error("상태 변경 실패:", error);
        alert(error.response?.data?.message || "상태 변경에 실패했습니다.");
      }
    }
  };

  const handleInterviewOffer = async () => {
    if (!applicant || !user?.companyId) return;
    if (isSendingOffer) return;

    if (applicant.documentStatus === "PASSED") {
      alert("이미 면접 제안을 보낸 지원자입니다.");
      return;
    }
    if (
      applicant.finalStatus === "PASSED" || // PASSED 체크
      applicant.finalStatus === "REJECTED"
    ) {
      alert("최종 결과가 확정된 지원자에게는 면접 제안을 보낼 수 없습니다.");
      return;
    }

    if (
      window.confirm(`${applicant.userName}님에게 면접 제안을 하시겠습니까?`)
    ) {
      try {
        setIsSendingOffer(true);
        await createInterviewOffer(user.companyId, {
          userId: applicant.userId,
          jobId: applicant.jobId,
          applyId: applicant.applyId,
        });

        alert(
          "면접 제안이 성공적으로 전송되었습니다.\n지원 현황이 '서류심사 통과'로 업데이트됩니다.",
        );

        setApplicant((prev) =>
          prev ? { ...prev, documentStatus: "PASSED" } : null,
        );
      } catch (error: any) {
        console.error("면접 제안 실패:", error);
        alert(error.response?.data?.message || "면접 제안에 실패했습니다.");
      } finally {
        setIsSendingOffer(false);
      }
    }
  };

  // ✅ [수정] 상태별 색상 (PASSED 추가)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "REVIEWING":
        return "bg-blue-100 text-blue-700";
      case "ACCEPTED": // 혹시 모르니 남겨둠
      case "PASSED": // ✅ PASSED 추가
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "CANCELED":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ✅ [수정] 상태 텍스트 (PASSED 추가)
  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "대기중";
      case "REVIEWING":
        return "검토중";
      case "ACCEPTED":
      case "PASSED": // ✅ PASSED 추가
        return "합격";
      case "REJECTED":
        return "불합격";
      case "CANCELED":
        return "면접거절";
      default:
        return status;
    }
  };

  const parseStructuredData = (structuredData: string | undefined) => {
    if (!structuredData) return null;
    try {
      return JSON.parse(structuredData);
    } catch {
      return null;
    }
  };

  const structuredData = resume
    ? parseStructuredData(resume.structuredData)
    : null;

  const handlePortfolioDownload = async (portfolio: any) => {
    if (!user?.userId || !applicant?.resumeId) return;

    if (portfolio?.portfolioId) {
      try {
        const response = await api.get(
          `/api/resume/${applicant.resumeId}/portfolios/${portfolio.portfolioId}/download`,
          {
            headers: { userId: user.userId.toString() },
            responseType: "blob",
          },
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          portfolio.filename || portfolio.fileName || "portfolio",
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("포트폴리오 다운로드 오류:", error);
        alert(
          "포트폴리오를 다운로드할 수 없습니다. 파일이 서버에 없을 수 있습니다.",
        );
      }
    } else {
      alert(
        "이 포트폴리오는 파일명만 저장되어 있습니다.\n실제 파일이 없어서 다운로드할 수 없습니다.",
      );
    }
  };

  const handleCoverLetterDownload = async (file: any) => {
    if (!user?.userId) return;

    const coverLetterId = typeof file === "object" ? file.coverLetterId : null;

    let filename =
      typeof file === "string"
        ? file
        : file.title || file.filename || "coverletter";
    if (typeof file === "object" && file.fileType) {
      const ext = String(file.fileType).toLowerCase();
      if (!filename.toLowerCase().endsWith(`.${ext}`)) {
        filename = `${filename}.${ext}`;
      }
    }

    if (coverLetterId) {
      try {
        const response = await api.get(
          `/api/coverletters/${coverLetterId}/file`,
          {
            params: { userId: user.userId },
            responseType: "blob",
          },
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("자기소개서 다운로드 오류:", error);
        alert(
          "자기소개서를 다운로드할 수 없습니다. 파일이 서버에 없을 수 있습니다.",
        );
      }
    } else {
      alert(
        "이 자기소개서는 파일명만 저장되어 있습니다.\n실제 파일이 없어서 다운로드할 수 없습니다.",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">
          지원자 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex gap-10 px-6 py-8 mx-auto max-w-screen-2xl">
        <aside className="flex-shrink-0 hidden w-64 lg:block">
          <CompanyLeftSidebar
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
          />
        </aside>

        <main className="flex-1 min-w-0">
          <div className="p-8 bg-white shadow-lg rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackClick}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <span>←</span>
                <span>목록으로 돌아가기</span>
              </button>
              <span
                className={`px-4 py-1.5 text-sm font-semibold rounded-full ${getStatusColor(
                  applicant.status,
                )}`}
              >
                {getStatusText(applicant.status)}
              </span>
            </div>

            {/* 인적사항 */}
            {(applicant.userName ||
              applicant.userEmail ||
              applicant.gender ||
              applicant.userPhone ||
              applicant.birthDate ||
              applicant.address ||
              applicant.profileImage) && (
              <div className="p-6 mb-8 border-2 border-indigo-200 rounded-lg bg-indigo-50">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  📋 인적사항
                </h2>
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  {applicant.profileImage && (
                    <div className="flex justify-center md:justify-start">
                      <img
                        src={applicant.profileImage}
                        alt="프로필 이미지"
                        className="object-cover w-40 h-48 bg-white border-2 border-indigo-200 rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                  <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                    {applicant.userName && (
                      <div className="p-3 bg-white border border-indigo-200 rounded-lg">
                        <div className="mb-1 text-xs font-medium text-gray-500">
                          이름
                        </div>
                        <div className="font-semibold text-gray-900">
                          {applicant.userName}
                        </div>
                      </div>
                    )}
                    {applicant.gender && (
                      <div className="p-3 bg-white border border-indigo-200 rounded-lg">
                        <div className="mb-1 text-xs font-medium text-gray-500">
                          성별
                        </div>
                        <div className="font-semibold text-gray-900">
                          {applicant.gender === "MALE"
                            ? "남성"
                            : applicant.gender === "FEMALE"
                              ? "여성"
                              : applicant.gender}
                        </div>
                      </div>
                    )}
                    {applicant.birthDate && (
                      <div className="p-3 bg-white border border-indigo-200 rounded-lg">
                        <div className="mb-1 text-xs font-medium text-gray-500">
                          생년월일
                        </div>
                        <div className="font-semibold text-gray-900">
                          {applicant.birthDate}
                        </div>
                      </div>
                    )}
                    {applicant.userEmail && (
                      <div className="p-3 bg-white border border-indigo-200 rounded-lg">
                        <div className="mb-1 text-xs font-medium text-gray-500">
                          이메일
                        </div>
                        <div className="font-semibold text-gray-900">
                          {applicant.userEmail}
                        </div>
                      </div>
                    )}
                    {applicant.userPhone && (
                      <div className="p-3 bg-white border border-indigo-200 rounded-lg">
                        <div className="mb-1 text-xs font-medium text-gray-500">
                          연락처
                        </div>
                        <div className="font-semibold text-gray-900">
                          {applicant.userPhone}
                        </div>
                      </div>
                    )}
                    {applicant.address && (
                      <div className="p-3 bg-white border border-indigo-200 rounded-lg">
                        <div className="mb-1 text-xs font-medium text-gray-500">
                          주소
                        </div>
                        <div className="font-semibold text-gray-900">
                          {applicant.address}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 주요 스킬 */}
            {applicant.skills && applicant.skills.length > 0 && (
              <div className="p-6 mb-8 border-2 border-purple-200 rounded-lg bg-purple-50">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  💻 주요 스킬
                </h2>
                <div className="flex flex-wrap gap-2">
                  {applicant.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 text-sm font-semibold text-purple-700 bg-white border-2 border-purple-300 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 경험/활동 */}
            {applicant.experiences && applicant.experiences.length > 0 && (
              <div className="p-6 mb-8 border-2 border-orange-200 rounded-lg bg-orange-50">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  🌟 경험/활동/교육
                </h2>
                <div className="space-y-3">
                  {applicant.experiences.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white border border-orange-200 rounded-lg"
                    >
                      <div className="font-semibold text-gray-900">
                        {exp.title}
                      </div>
                      <div className="text-sm text-gray-600">{exp.period}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 자격증 */}
            {applicant.certificates && applicant.certificates.length > 0 && (
              <div className="p-6 mb-8 border-2 border-yellow-200 rounded-lg bg-yellow-50">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  🏆 자격증/어학/수상
                </h2>
                <div className="space-y-3">
                  {applicant.certificates.map((cert, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white border border-yellow-200 rounded-lg"
                    >
                      <div className="font-semibold text-gray-900">
                        {cert.title}
                      </div>
                      <div className="text-sm text-gray-600">{cert.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 학력 */}
            {applicant.educations && applicant.educations.length > 0 && (
              <div className="p-6 mb-8 border-2 border-blue-200 rounded-lg bg-blue-50">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  🎓 학력
                </h2>
                <div className="space-y-3">
                  {applicant.educations.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white border border-blue-200 rounded-lg"
                    >
                      <div className="font-semibold text-gray-900">
                        {edu.school}
                      </div>
                      <div className="text-sm text-gray-600">{edu.period}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 경력 */}
            {applicant.careers && applicant.careers.length > 0 && (
              <div className="p-6 mb-8 border-2 border-teal-200 rounded-lg bg-teal-50">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  경력 ({applicant.experience || "신입"})
                </h2>
                <div className="space-y-3">
                  {applicant.careers.map((career, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white border border-teal-200 rounded-lg"
                    >
                      <div className="font-semibold text-gray-900">
                        {career.company}
                      </div>
                      <div className="text-sm text-gray-600">
                        {career.period}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 포트폴리오 */}
            {resume?.portfolios && resume.portfolios.length > 0 && (
              <div className="p-6 mb-8 border-2 border-pink-200 rounded-lg bg-pink-50">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  📁 포트폴리오
                </h2>
                <div className="space-y-3">
                  {resume.portfolios.map((portfolio: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-white border border-pink-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {portfolio.fileType === "pdf" ? "📄" : "📃"}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {portfolio.filename}
                          </p>
                          <p className="text-sm text-gray-600">
                            {portfolio.description || "설명 없음"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePortfolioDownload(portfolio)}
                        className="px-4 py-2 text-sm font-semibold text-pink-700 transition bg-white border-2 border-pink-300 rounded-lg hover:bg-pink-100"
                      >
                        다운로드
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 포트폴리오 (구버전) */}
            {(!resume?.portfolios || resume.portfolios.length === 0) &&
              structuredData?.portfolios &&
              structuredData.portfolios.length > 0 && (
                <div className="p-6 mb-8 border-2 border-pink-200 rounded-lg bg-pink-50">
                  <h2 className="mb-4 text-lg font-bold text-gray-900">
                    📁 포트폴리오
                  </h2>
                  <div className="space-y-3">
                    {structuredData.portfolios.map(
                      (portfolio: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-white border border-pink-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {portfolio.filename?.endsWith(".pdf")
                                ? "📄"
                                : "📃"}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {portfolio.filename}
                              </p>
                              <p className="text-sm text-gray-600">
                                {portfolio.portfolioId
                                  ? "다운로드 가능"
                                  : "파일명만 저장됨"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handlePortfolioDownload(portfolio)}
                            className="px-4 py-2 text-sm font-semibold text-pink-700 transition bg-white border-2 border-pink-300 rounded-lg hover:bg-pink-100"
                          >
                            다운로드
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* 자기소개서 */}
            {resume?.coverLetters && resume.coverLetters.length > 0 && (
              <div className="p-6 mb-8 border-2 border-green-200 rounded-lg bg-green-50">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  ✍️ 자기소개서
                </h2>
                <div className="space-y-4">
                  {resume.coverLetters.map((coverLetter: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-white border border-green-200 rounded-lg"
                    >
                      {coverLetter.filePath && (
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-green-200">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {coverLetter.fileType === "pdf" ? "📄" : "📃"}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {coverLetter.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                파일 다운로드 가능
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleCoverLetterDownload(coverLetter)
                            }
                            className="px-4 py-2 text-sm font-semibold text-green-700 transition bg-white border-2 border-green-300 rounded-lg hover:bg-green-100"
                          >
                            다운로드
                          </button>
                        </div>
                      )}

                      {coverLetter.content && (
                        <div>
                          {coverLetter.title && !coverLetter.filePath && (
                            <h3 className="mb-3 text-lg font-bold text-gray-900">
                              {coverLetter.title}
                            </h3>
                          )}
                          <p className="leading-relaxed text-gray-700 whitespace-pre-wrap">
                            {coverLetter.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 자기소개서 텍스트 */}
            {applicant.coverLetterContent && (
              <div className="p-6 mb-8 border-2 border-green-200 rounded-lg bg-green-50">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  ✍️ 자기소개서
                  {applicant.coverLetterTitle &&
                    ` - ${applicant.coverLetterTitle}`}
                </h2>
                <div className="p-4 bg-white border border-green-200 rounded-lg">
                  <p className="leading-relaxed text-gray-900 whitespace-pre-wrap">
                    {applicant.coverLetterContent}
                  </p>
                </div>
              </div>
            )}

            {/* 메모 */}
            {applicant.notes && (
              <div className="p-6 mb-8 rounded-lg bg-blue-50">
                <h2 className="mb-4 text-lg font-bold text-gray-900">메모</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {applicant.notes}
                </p>
              </div>
            )}

            {/* 하단 버튼 영역 (PASSED 수정됨) */}
            <div className="flex gap-4">
              {/* 합격 처리 버튼 (토글) */}
              <button
                onClick={handleAccept}
                disabled={applicant.finalStatus === "REJECTED"}
                className={`flex-1 px-6 py-3 font-semibold transition rounded-lg ${
                  applicant.finalStatus === "PASSED"
                    ? "bg-green-600 text-white shadow-inner cursor-default" // 활성 (이미 합격)
                    : applicant.finalStatus === "REJECTED"
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50" // 비활성 (불합격됨)
                      : "bg-green-600 text-white hover:bg-green-700" // 대기중
                }`}
              >
                {applicant.finalStatus === "PASSED"
                  ? "합격 처리됨"
                  : "합격 처리"}
              </button>

              {/* 불합격 처리 버튼 (토글) */}
              <button
                onClick={handleReject}
                disabled={applicant.finalStatus === "PASSED"}
                className={`flex-1 px-6 py-3 font-semibold transition rounded-lg ${
                  applicant.finalStatus === "REJECTED"
                    ? "bg-red-600 text-white shadow-inner cursor-default" // 활성 (이미 불합격)
                    : applicant.finalStatus === "PASSED"
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50" // 비활성 (합격됨)
                      : "bg-red-600 text-white hover:bg-red-700" // 대기중
                }`}
              >
                {applicant.finalStatus === "REJECTED"
                  ? "불합격 처리됨"
                  : "불합격 처리"}
              </button>

              {/* 면접 진행 버튼 (로딩 표시) */}
              <button
                onClick={handleInterviewOffer}
                disabled={
                  isSendingOffer || // 전송중
                  applicant.documentStatus === "PASSED" ||
                  applicant.finalStatus === "PASSED" ||
                  applicant.finalStatus === "REJECTED"
                }
                className={`flex-1 px-6 py-3 font-semibold transition rounded-lg flex justify-center items-center gap-2 ${
                  applicant.documentStatus === "PASSED"
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed" // 이미 보냄
                    : isSendingOffer
                      ? "bg-blue-400 text-white cursor-wait" // 전송중
                      : "bg-blue-600 text-white hover:bg-blue-700" // 기본
                }`}
              >
                {isSendingOffer ? (
                  <>
                    <svg
                      className="w-5 h-5 text-white animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    전송 중...
                  </>
                ) : applicant.documentStatus === "PASSED" ? (
                  "면접 제안 완료"
                ) : (
                  "면접 진행"
                )}
              </button>

              <button
                onClick={handleCompatibilityClick}
                className="flex-1 px-6 py-3 font-semibold text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                적합성 상세
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
