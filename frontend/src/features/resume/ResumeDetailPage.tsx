import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import LeftSidebar from "../../components/LeftSidebar";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import {
  getResumeDetail,
  deleteResume,
  type ResumeResponse,
} from "../../api/resume";
import api from "../../api/axios";

type Visibility = "PUBLIC" | "PRIVATE";

export default function ResumeDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resumeId } = useParams();
  const { user } = useAuthStore();
  const { activeMenu, handleMenuClick } = usePageNavigation(
    "resume",
    "resume-sub-1",
  );

  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ 목록에서 변경 후 곧바로 상세로 들어오면(서버 반영 지연/레이스) 대비:
  // 1) location.state로 기대 visibility를 전달받으면 그 값과 서버 응답이 다를 때 재조회
  // 2) (옵션) localStorage override를 쓰는 경우도 대응 (키: resume_visibility_override_map)
  const expectedVisibilityFromNav = (location.state as any)
    ?.expectedVisibility as Visibility | undefined;

  const refetchTimerRef = useRef<number | null>(null);
  const attemptRef = useRef(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ localStorage override (선택사항)
  const getLocalVisibilityOverride = (rid: number): Visibility | null => {
    try {
      const raw = localStorage.getItem("resume_visibility_override_map");
      if (!raw) return null;
      const map = JSON.parse(raw);
      const v = map?.[String(rid)];
      if (v === "PUBLIC" || v === "PRIVATE") return v;
      return null;
    } catch {
      return null;
    }
  };

  const clearRefetchTimer = () => {
    if (refetchTimerRef.current) {
      window.clearTimeout(refetchTimerRef.current);
      refetchTimerRef.current = null;
    }
  };

  useEffect(() => {
    const loadResumeDetail = async () => {
      if (!resumeId || !user?.userId) {
        alert("잘못된 접근입니다.");
        navigate("/user/resume");
        return;
      }

      const rid = parseInt(resumeId, 10);

      try {
        setLoading(true);

        const data = await getResumeDetail(rid, user.userId);

        // ✅ override 우선순위:
        // 1) 목록에서 navigation state로 넘어온 expectedVisibility
        // 2) localStorage override (선택)
        // 3) 서버 응답 그대로
        const localOverride = getLocalVisibilityOverride(rid);
        const expected = expectedVisibilityFromNav ?? localOverride;

        const merged: ResumeResponse = expected
          ? { ...data, visibility: expected }
          : data;

        setResume(merged);
        console.log("📥 받은 이력서 데이터:", data);

        // ✅ 만약 expected(목록에서 막 바꾼 값)가 있고,
        // 서버 응답 visibility와 다르면 서버 반영이 늦은 케이스일 수 있어 재조회(최대 2회).
        // - expected가 없으면 불필요한 재조회는 하지 않음.
        if (
          expected &&
          data.visibility &&
          data.visibility !== expected &&
          attemptRef.current < 2
        ) {
          attemptRef.current += 1;
          clearRefetchTimer();
          refetchTimerRef.current = window.setTimeout(
            async () => {
              try {
                const again = await getResumeDetail(rid, user.userId);
                const mergedAgain: ResumeResponse = {
                  ...again,
                  visibility: expected, // 화면은 기대값 유지 (서버 반영 지연 동안 UX 보호)
                };
                setResume(mergedAgain);

                // 서버가 따라오면(다시 조회했는데 서버 값도 expected가 되면) 기대값 강제 유지 불필요
                // -> 다음 렌더부터는 서버값을 보여주고 싶으면 아래처럼 처리 가능:
                // if (again.visibility === expected) setResume(again);
              } catch (e) {
                // 재조회 실패는 조용히 무시 (기본 데이터는 이미 있음)
              }
            },
            attemptRef.current === 1 ? 400 : 1200,
          );
        }
      } catch (error: any) {
        console.error("이력서 상세 조회 실패:", error);
        alert(
          error.response?.data?.message ||
            "이력서 정보를 불러오는데 실패했습니다.",
        );
        navigate("/user/resume");
      } finally {
        setLoading(false);
      }
    };

    attemptRef.current = 0;
    clearRefetchTimer();
    loadResumeDetail();

    return () => {
      clearRefetchTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, user?.userId, navigate]); // ✅ user 전체 대신 userId만

  const handleBackClick = () => {
    navigate("/user/resume");
  };

  const handleEditClick = () => {
    navigate(`/user/resume/edit/${resumeId}`);
  };

  const handleFileDownload = async () => {
    if (!resumeId || !user?.userId || !resume) return;

    try {
      const response = await api.get(`/api/resume/${resumeId}/download`, {
        headers: {
          userId: user.userId.toString(),
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const fileName = `${resume.title}.${resume.fileType || "docx"}`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("파일 다운로드 오류:", error);
      alert(
        error.response?.data?.message ||
          "파일 다운로드 중 오류가 발생했습니다.",
      );
    }
  };

  const handlePortfolioDownload = async (portfolio: any) => {
    if (!resumeId || !user?.userId) return;

    if (portfolio.portfolioId) {
      try {
        const response = await api.get(
          `/api/resume/${resumeId}/portfolios/${portfolio.portfolioId}/download`,
          {
            headers: {
              userId: user.userId.toString(),
            },
            responseType: "blob",
          },
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", portfolio.filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error: any) {
        console.error("포트폴리오 다운로드 오류:", error);
        alert(
          "포트폴리오를 다운로드할 수 없습니다. 파일이 서버에 저장되지 않았을 수 있습니다.",
        );
      }
    } else {
      alert(
        "이 이력서의 포트폴리오는 파일명만 저장되어 있습니다.\n실제 파일을 다운로드하려면 이력서를 다시 작성하거나 포트폴리오를 별도로 업로드해주세요.",
      );
    }
  };

  const handleCoverLetterDownload = async (file: any) => {
    if (!user?.userId) return;

    const coverLetterId = typeof file === "object" ? file.coverLetterId : null;

    let filename = typeof file === "string" ? file : file.title;

    if (typeof file === "object" && file.fileType) {
      const fileType = file.fileType.toLowerCase();
      if (!filename.toLowerCase().endsWith(`.${fileType}`)) {
        filename = `${filename}.${fileType}`;
      }
    }

    if (coverLetterId) {
      try {
        const response = await api.get(
          `/api/coverletters/${coverLetterId}/file`,
          {
            params: {
              userId: user.userId,
            },
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
      } catch (error: any) {
        console.error("자기소개서 다운로드 오류:", error);
        alert(
          "자기소개서를 다운로드할 수 없습니다. 파일이 서버에 저장되지 않았을 수 있습니다.",
        );
      }
    } else {
      alert(
        "이 이력서의 자기소개서는 파일명만 저장되어 있습니다.\n실제 파일을 다운로드하려면 이력서를 다시 작성하거나 자기소개서를 별도로 업로드해주세요.",
      );
    }
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);

  const handleConfirmDelete = async () => {
    if (!resumeId || !user?.userId) return;

    setIsDeleting(true);
    try {
      await deleteResume(parseInt(resumeId, 10), user.userId);
      alert("이력서가 삭제되었습니다.");
      navigate("/user/resume");
    } catch (error: any) {
      console.error("이력서 삭제 실패:", error);
      alert(error.response?.data?.message || "이력서 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => setShowDeleteConfirm(false);

  const parseExperiences = (experiences: string | undefined) => {
    if (!experiences) return [];
    try {
      return JSON.parse(experiences);
    } catch {
      return [];
    }
  };

  const parseCertificates = (certificates: string | undefined) => {
    if (!certificates) return [];
    try {
      return JSON.parse(certificates);
    } catch {
      return [];
    }
  };

  const parseEducations = (educations: string | undefined) => {
    if (!educations) return [];
    try {
      return JSON.parse(educations);
    } catch {
      return [];
    }
  };

  const parseCareers = (careers: string | undefined) => {
    if (!careers) return [];
    try {
      return JSON.parse(careers);
    } catch {
      return [];
    }
  };

  const parseSkills = (skills: string | undefined) => {
    if (!skills) return [];
    return skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
  };

  const parseStructuredData = (structuredData: string | undefined) => {
    if (!structuredData) return null;
    try {
      return JSON.parse(structuredData);
    } catch {
      return null;
    }
  };

  // ✅ 공통 라벨 행(“회사명: 카카오” 스타일) 컴포넌트
  const LabelRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex gap-3 text-sm leading-6">
      <div className="w-20 text-gray-600 shrink-0">{label}</div>
      <div className="flex-1 text-gray-900 whitespace-pre-wrap">
        {value && value.trim() ? value : "-"}
      </div>
    </div>
  );

  // ✅ 섹션 컨테이너: 검은 줄 하나로만 구분
  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section className="py-8 border-t border-gray-300">
      <h2 className="mb-4 text-lg font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">
          이력서 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const experiences = parseExperiences(resume.experiences);
  const certificates = parseCertificates(resume.certificates);
  const educations = parseEducations(resume.educations);
  const careers = parseCareers(resume.careers);
  const skills = parseSkills(resume.skills);

  const structuredData = parseStructuredData(resume.structuredData);

  const isFormBasedResume =
    !resume.filePath ||
    experiences.length > 0 ||
    certificates.length > 0 ||
    educations.length > 0 ||
    careers.length > 0 ||
    (resume.structuredData && resume.structuredData.trim() !== "");

  return (
    <>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-8 mx-4 bg-white shadow-2xl rounded-2xl">
            <div className="mb-6 text-center">
              <div className="mb-4 text-5xl">⚠️</div>
              <h3 className="mb-4 text-2xl font-bold">
                이력서를 삭제하시겠습니까?
              </h3>
              <p className="mt-2 text-gray-500">
                삭제된 이력서는 복구할 수 없습니다.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 font-semibold text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white">
        <div className="px-4 py-8 mx-auto bg-white max-w-7xl">
          {/* 1. 부모 Flex 컨테이너: items-start 필수 */}
          <div className="flex items-start gap-6">
            {/* 2. 왼쪽 고정 영역 (제목 + 사이드바) */}
            {/* sticky: 고정, top-10: 상단 여백, shrink-0: 찌그러짐 방지 */}
            <div className="sticky flex flex-col gap-6 top-10 shrink-0">
              {/* 제목을 여기로 가져오세요 */}
              <h2 className="px-2 text-2xl font-bold">이력서 상세</h2>

              {/* 사이드바 컴포넌트 */}
              <LeftSidebar
                activeMenu={activeMenu}
                onMenuClick={handleMenuClick}
              />
            </div>

            {/* 3. 오른쪽 컨텐츠 영역 */}
            <div className="flex-1 space-y-8">
              <div className="p-8 bg-white border border-gray-300 rounded-2xl">
                {/* 상단 버튼 영역 */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleBackClick}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <span>←</span>
                    <span>목록으로 돌아가기</span>
                  </button>

                  <div className="flex items-center gap-3">
                    {/* 배지는 컬러 최소화: 테두리형으로 정리 */}
                    <span className="px-3 py-1 text-sm font-semibold text-gray-900 border border-gray-400 rounded-full">
                      {resume.visibility === "PUBLIC" ? "공개" : "비공개"}
                    </span>
                    <span className="px-3 py-1 text-sm font-semibold text-gray-900 border border-gray-400 rounded-full">
                      {resume.status === "COMPLETED" ? "완료" : "작성중"}
                    </span>

                    {isFormBasedResume && (
                      <button
                        onClick={handleEditClick}
                        className="px-4 py-2 font-semibold text-white transition bg-blue-500 rounded-lg hover:bg-gray-800"
                      >
                        수정
                      </button>
                    )}

                    {resume.filePath && (
                      <button
                        onClick={handleFileDownload}
                        className="px-4 py-2 font-semibold text-white transition bg-black rounded-lg hover:bg-gray-800"
                      >
                        다운로드
                      </button>
                    )}

                    <button
                      onClick={handleDeleteClick}
                      className="px-4 py-2 font-semibold text-white transition bg-red-500 rounded-lg hover:bg-gray-800"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {/* 헤더 */}
                <div className="pb-8 border-b border-gray-400">
                  <h1 className="mb-4 text-3xl font-bold text-gray-900">
                    {resume.title}
                  </h1>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">직무</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {resume.jobCategory || "미지정"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">조회수</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {resume.viewCount}회
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">작성일</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(resume.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ===== 인적사항 ===== */}
                {(resume.resumeName ||
                  resume.resumeEmail ||
                  resume.resumeGender ||
                  resume.resumePhone ||
                  resume.resumeBirthDate ||
                  resume.resumeAddress ||
                  resume.profileImage) && (
                  <Section title="인적사항">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                      {resume.profileImage && (
                        <div className="flex justify-center md:justify-start">
                          <img
                            src={resume.profileImage}
                            alt="프로필 이미지"
                            className="object-cover w-40 h-48 bg-white border border-gray-300 rounded-lg"
                          />
                        </div>
                      )}

                      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* 이름 */}
                        <div className="p-4 border border-gray-300 rounded-lg">
                          <div className="text-xs text-gray-500">이름</div>
                          <div className="mt-1 font-semibold text-gray-800">
                            {resume.resumeName || "-"}
                          </div>
                        </div>

                        {/* 성별 */}
                        <div className="p-4 border border-gray-300 rounded-lg">
                          <div className="text-xs text-gray-500">성별</div>
                          <div className="mt-1 font-semibold text-gray-800">
                            {resume.resumeGender
                              ? resume.resumeGender === "MALE"
                                ? "남성"
                                : "여성"
                              : "-"}
                          </div>
                        </div>

                        {/* 생년월일 */}
                        <div className="p-4 border border-gray-300 rounded-lg">
                          <div className="text-xs text-gray-500">생년월일</div>
                          <div className="mt-1 font-semibold text-gray-800">
                            {resume.resumeBirthDate || "-"}
                          </div>
                        </div>

                        {/* 이메일 */}
                        <div className="p-4 border border-gray-300 rounded-lg">
                          <div className="text-xs text-gray-500">이메일</div>
                          <div className="mt-1 font-semibold text-gray-800">
                            {resume.resumeEmail || "-"}
                          </div>
                        </div>

                        {/* ✅ 주소 → 이메일 옆 */}
                        <div className="p-4 border border-gray-300 rounded-lg">
                          <div className="text-xs text-gray-500">주소</div>
                          <div className="mt-1 font-semibold text-gray-800">
                            {resume.resumeAddress || "-"}
                            {resume.resumeDetailAddress
                              ? ` ${resume.resumeDetailAddress}`
                              : ""}
                          </div>
                        </div>

                        {/* 연락처 */}
                        <div className="p-4 border border-gray-300 rounded-lg">
                          <div className="text-xs text-gray-500">연락처</div>
                          <div className="mt-1 font-semibold text-gray-800">
                            {resume.resumePhone || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Section>
                )}


                {/* ===== 주요 스킬 ===== */}
                {skills.length > 0 && (
                  <Section title="주요 스킬">
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-sm text-gray-900 border border-gray-400 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* ===== 경험/활동/교육 ===== */}
                {experiences.length > 0 && (
                  <Section title="경험/활동/교육">
                    <div className="space-y-3">
                      {experiences.map((exp: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 border border-gray-400 rounded-lg"
                        >
                          <div className="font-semibold text-gray-900">
                            {exp.title}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            {exp.period}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* ===== 자격증/어학/수상 ===== */}
                {certificates.length > 0 && (
                  <Section title="자격증/어학/수상">
                    <div className="space-y-3">
                      {certificates.map((cert: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 border border-gray-400 rounded-lg"
                        >
                          <div className="font-semibold text-gray-900">
                            {cert.title}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            {cert.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* ===== 학력 ===== */}
                {educations.length > 0 && (
                  <Section title="학력">
                    <div className="space-y-3">
                      {educations.map((edu: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 border border-gray-400 rounded-lg"
                        >
                          <div className="font-semibold text-gray-900">
                            {edu.school}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            {edu.period}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* ===== 경력 (라벨형) ===== */}
                {careers.length > 0 && (
                  <Section title="경력">
                    <div className="space-y-3">
                      {careers.map((career: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 border border-gray-400 rounded-lg"
                        >
                          <LabelRow label="회사명" value={career.company} />
                          <div className="mt-2" />
                          <LabelRow label="직급" value={career.position} />
                          <div className="mt-2" />
                          <LabelRow label="기간" value={career.period} />
                          <div className="mt-2" />
                          <LabelRow label="직무" value={career.role} />
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* ===== 포트폴리오 (백엔드) ===== */}
                {resume.portfolios && resume.portfolios.length > 0 && (
                  <Section title="포트폴리오">
                    <div className="space-y-3">
                      {resume.portfolios.map((portfolio: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 border border-gray-400 rounded-lg"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {portfolio.filename}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              {portfolio.description || "설명 없음"}
                            </p>
                          </div>
                          <button
                            onClick={() => handlePortfolioDownload(portfolio)}
                            className="px-4 py-2 text-sm font-semibold text-gray-900 border border-gray-400 rounded-lg hover:bg-gray-50"
                          >
                            다운로드
                          </button>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* ===== 포트폴리오 (structuredData 하위호환) ===== */}
                {(!resume.portfolios || resume.portfolios.length === 0) &&
                  structuredData?.portfolios &&
                  structuredData.portfolios.length > 0 && (
                    <Section title="포트폴리오">
                      <div className="space-y-3">
                        {structuredData.portfolios.map(
                          (portfolio: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-4 border border-gray-400 rounded-lg"
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {portfolio.filename}
                                </p>
                                <p className="mt-1 text-sm text-gray-600">
                                  {portfolio.portfolioId
                                    ? "다운로드 가능"
                                    : "파일명만 저장됨"}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handlePortfolioDownload(portfolio)
                                }
                                className="px-4 py-2 text-sm font-semibold text-gray-900 border border-gray-400 rounded-lg hover:bg-gray-50"
                              >
                                다운로드
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    </Section>
                  )}

                {/* ===== 자기소개서 (백엔드) ===== */}
                {resume.coverLetters && resume.coverLetters.length > 0 && (
                  <Section title="자기소개서">
                    <div className="space-y-4">
                      {resume.coverLetters.map(
                        (coverLetter: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 border border-gray-400 rounded-lg"
                          >
                            {coverLetter.filePath && (
                              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-400">
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">
                                    {coverLetter.title}
                                  </p>
                                  <p className="mt-1 text-sm text-gray-600">
                                    파일 다운로드 가능
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    handleCoverLetterDownload(coverLetter)
                                  }
                                  className="px-4 py-2 text-sm font-semibold text-gray-900 border border-gray-400 rounded-lg hover:bg-gray-50"
                                >
                                  다운로드
                                </button>
                              </div>
                            )}

                            {coverLetter.content && (
                              <div>
                                {coverLetter.title && !coverLetter.filePath && (
                                  <h3 className="mb-3 text-base font-bold text-gray-900">
                                    {coverLetter.title}
                                  </h3>
                                )}
                                <p className="leading-relaxed text-gray-900 whitespace-pre-wrap">
                                  {coverLetter.content}
                                </p>
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </Section>
                )}

                {/* ===== 자기소개서 (structuredData 하위호환) ===== */}
                {(!resume.coverLetters || resume.coverLetters.length === 0) && (
                  <>
                    {structuredData?.coverLetter?.files &&
                      structuredData.coverLetter.files.length > 0 && (
                        <Section title="자기소개서 파일">
                          <div className="space-y-3">
                            {structuredData.coverLetter.files.map(
                              (file: any, idx: number) => {
                                const filename =
                                  typeof file === "string"
                                    ? file
                                    : file.filename;
                                const coverLetterId =
                                  typeof file === "object"
                                    ? file.coverLetterId
                                    : null;

                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 border border-gray-400 rounded-lg"
                                  >
                                    <div className="min-w-0">
                                      <p className="font-semibold text-gray-900 truncate">
                                        {filename}
                                      </p>
                                      <p className="mt-1 text-sm text-gray-600">
                                        {coverLetterId
                                          ? "다운로드 가능"
                                          : "파일명만 저장됨"}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleCoverLetterDownload(file)
                                      }
                                      className="px-4 py-2 text-sm font-semibold text-gray-900 border border-gray-400 rounded-lg hover:bg-gray-50"
                                    >
                                      다운로드
                                    </button>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </Section>
                      )}

                    {structuredData?.coverLetter &&
                      structuredData.coverLetter.content && (
                        <Section
                          title={
                            structuredData.coverLetter.title
                              ? `자기소개서 - ${structuredData.coverLetter.title}`
                              : "자기소개서"
                          }
                        >
                          <div className="p-4 border border-gray-400 rounded-lg">
                            <p className="leading-relaxed text-gray-900 whitespace-pre-wrap">
                              {structuredData.coverLetter.content}
                            </p>
                          </div>
                        </Section>
                      )}
                  </>
                )}

                {/* 하단 버튼 */}
                <div className="pt-8 border-t border-gray-300">
                  <div className="flex justify-end">
                    <button
                      onClick={handleBackClick}
                      className="px-8 py-3 font-semibold text-white transition bg-black rounded-lg hover:bg-gray-800"
                    >
                      목록으로
                    </button>
                  </div>
                </div>
                {/* end */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
