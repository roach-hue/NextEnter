import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import {
  getPublicResumeDetail,
  type ResumeResponse,
} from "../../api/resume";
import { saveTalent, contactTalent } from "../../api/talent";
import CompanyLeftSidebar from "../components/CompanyLeftSidebar";
import { useCompanyPageNavigation } from "../hooks/useCompanyPageNavigation";
import api from "../../api/axios";

interface TalentResumeDetailPageProps {
  resumeId?: number; // prop으로 받는 경우
  onBack?: () => void; // 뒤로가기 콜백
}

export default function TalentResumeDetailPage({ 
  resumeId: resumeIdProp, 
  onBack 
}: TalentResumeDetailPageProps = {}) {
  const { resumeId: resumeIdParam } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // prop으로 받은 resumeId 우선, 없으면 URL 파라미터 사용
  const resumeId = resumeIdProp?.toString() || resumeIdParam;
  
  const { activeMenu, handleMenuClick } = useCompanyPageNavigation(
    "talent",
    "talent-sub-1",
  );

  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadResumeDetail = async () => {
      if (!resumeId || !user?.userId) {
        alert("잘못된 접근입니다.");
        if (onBack) {
          onBack();
        } else {
          navigate("/company/talent-search");
        }
        return;
      }

      try {
        setLoading(true);
        const data = await getPublicResumeDetail(parseInt(resumeId), user.userId);
        setResume(data);
        console.log("📥 받은 이력서 데이터:", data);
      } catch (error: any) {
        console.error("이력서 조회 실패:", error);
        alert(
          error.response?.data?.message ||
            "이력서 정보를 불러오는데 실패했습니다.",
        );
        if (onBack) {
          onBack();
        } else {
          navigate("/company/talent-search");
        }
      } finally {
        setLoading(false);
      }
    };

    loadResumeDetail();
  }, [resumeId, user, navigate, onBack]);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/company/talent-search");
    }
  };

  const handleContact = async () => {
    if (!user?.userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!resumeId) return;

    const message = prompt("인재에게 보낼 메시지를 입력하세요:");
    if (!message) return;

    try {
      await contactTalent(parseInt(resumeId), message, user.userId);
      alert("스카우트 제안이 전송되었습니다!");
    } catch (error: any) {
      alert(error.response?.data?.message || "스카우트 제안에 실패했습니다.");
    }
  };

  const handleSave = async () => {
    if (!user?.userId || !resumeId) return;

    try {
      const response = await saveTalent(parseInt(resumeId), user.userId);
      if (response.success) {
        alert("인재가 스크랩되었습니다!");
      } else {
        alert("이미 스크랩된 인재입니다.");
      }
    } catch (error: any) {
      console.error("스크랩 오류:", error);
      alert("스크랩 중 오류가 발생했습니다.");
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
        alert("포트폴리오를 다운로드할 수 없습니다.");
      }
    } else {
      alert("이 포트폴리오는 파일명만 저장되어 있습니다.");
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
        alert("자기소개서를 다운로드할 수 없습니다.");
      }
    } else {
      alert("이 자기소개서는 파일명만 저장되어 있습니다.");
    }
  };

  // 파싱 함수들...
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

  const LabelRow = ({
    label,
    value,
  }: {
    label: string;
    value?: string;
  }) => (
    <div className="flex gap-3 text-sm leading-6">
      <div className="w-20 shrink-0 text-gray-600">{label}</div>
      <div className="flex-1 text-gray-900 whitespace-pre-wrap">
        {value && value.trim() ? value : "-"}
      </div>
    </div>
  );

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section className="py-8 border-t border-gray-900">
      <h2 className="mb-4 text-lg font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex gap-10 px-6 py-8 mx-auto max-w-screen-2xl">
          <aside className="flex-shrink-0 hidden w-64 lg:block">
            <CompanyLeftSidebar
              activeMenu={activeMenu}
              onMenuClick={handleMenuClick}
            />
          </aside>
          <main className="flex items-center justify-center flex-1 min-w-0">
            <div className="text-xl font-semibold text-gray-600">로딩 중...</div>
          </main>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex gap-10 px-6 py-8 mx-auto max-w-screen-2xl">
          <aside className="flex-shrink-0 hidden w-64 lg:block">
            <CompanyLeftSidebar
              activeMenu={activeMenu}
              onMenuClick={handleMenuClick}
            />
          </aside>
          <main className="flex-1 min-w-0">
            <div className="text-xl font-semibold text-gray-600">
              이력서 정보를 찾을 수 없습니다.
            </div>
          </main>
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

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <h2 className="mb-6 text-2xl font-bold">인재 이력서 상세</h2>

        <div className="flex gap-6">
          <aside className="flex-shrink-0 hidden w-64 lg:block">
            <CompanyLeftSidebar
              activeMenu={activeMenu}
              onMenuClick={handleMenuClick}
            />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="p-8 bg-white border border-gray-300 rounded-2xl">
              {/* 상단 버튼 */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBackClick}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <span>←</span>
                  <span>목록으로 돌아가기</span>
                </button>
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

              {/* 인적사항 */}
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
                          className="object-cover w-40 h-48 bg-white border border-gray-400 rounded-lg"
                        />
                      </div>
                    )}

                    <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                      {resume.resumeName && (
                        <div className="p-4 border border-gray-400 rounded-lg">
                          <div className="text-xs text-gray-500">이름</div>
                          <div className="mt-1 font-semibold text-gray-900">
                            {resume.resumeName}
                          </div>
                        </div>
                      )}
                      {resume.resumeGender && (
                        <div className="p-4 border border-gray-400 rounded-lg">
                          <div className="text-xs text-gray-500">성별</div>
                          <div className="mt-1 font-semibold text-gray-900">
                            {resume.resumeGender === "MALE" ? "남성" : "여성"}
                          </div>
                        </div>
                      )}
                      {resume.resumeBirthDate && (
                        <div className="p-4 border border-gray-400 rounded-lg">
                          <div className="text-xs text-gray-500">생년월일</div>
                          <div className="mt-1 font-semibold text-gray-900">
                            {resume.resumeBirthDate}
                          </div>
                        </div>
                      )}
                      {resume.resumeEmail && (
                        <div className="p-4 border border-gray-400 rounded-lg">
                          <div className="text-xs text-gray-500">이메일</div>
                          <div className="mt-1 font-semibold text-gray-900">
                            {resume.resumeEmail}
                          </div>
                        </div>
                      )}
                      {resume.resumePhone && (
                        <div className="p-4 border border-gray-400 rounded-lg">
                          <div className="text-xs text-gray-500">연락처</div>
                          <div className="mt-1 font-semibold text-gray-900">
                            {resume.resumePhone}
                          </div>
                        </div>
                      )}
                      {resume.resumeAddress && (
                        <div className="p-4 border border-gray-400 rounded-lg sm:col-span-2">
                          <div className="text-xs text-gray-500">주소</div>
                          <div className="mt-1 font-semibold text-gray-900">
                            {resume.resumeAddress}
                            {resume.resumeDetailAddress
                              ? ` ${resume.resumeDetailAddress}`
                              : ""}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Section>
              )}

              {/* 주요 스킬 */}
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

              {/* 경험/활동/교육 */}
              {experiences.length > 0 && (
                <Section title="경험/활동/교육">
                  <div className="space-y-3">
                    {experiences.map((exp: any, idx: number) => (
                      <div key={idx} className="p-4 border border-gray-400 rounded-lg">
                        <div className="font-semibold text-gray-900">{exp.title}</div>
                        <div className="mt-1 text-sm text-gray-600">{exp.period}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* 자격증/어학/수상 */}
              {certificates.length > 0 && (
                <Section title="자격증/어학/수상">
                  <div className="space-y-3">
                    {certificates.map((cert: any, idx: number) => (
                      <div key={idx} className="p-4 border border-gray-400 rounded-lg">
                        <div className="font-semibold text-gray-900">{cert.title}</div>
                        <div className="mt-1 text-sm text-gray-600">{cert.date}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* 학력 */}
              {educations.length > 0 && (
                <Section title="학력">
                  <div className="space-y-3">
                    {educations.map((edu: any, idx: number) => (
                      <div key={idx} className="p-4 border border-gray-400 rounded-lg">
                        <div className="font-semibold text-gray-900">{edu.school}</div>
                        <div className="mt-1 text-sm text-gray-600">{edu.period}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* 경력 */}
              {careers.length > 0 && (
                <Section title="경력">
                  <div className="space-y-3">
                    {careers.map((career: any, idx: number) => (
                      <div key={idx} className="p-4 border border-gray-400 rounded-lg">
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

              {/* 포트폴리오 */}
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

              {/* 자기소개서 */}
              {resume.coverLetters && resume.coverLetters.length > 0 && (
                <Section title="자기소개서">
                  <div className="space-y-4">
                    {resume.coverLetters.map((coverLetter: any, idx: number) => (
                      <div key={idx} className="p-4 border border-gray-400 rounded-lg">
                        {coverLetter.filePath && (
                          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-400">
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {coverLetter.title}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCoverLetterDownload(coverLetter)}
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
                            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                              {coverLetter.content}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* 하단 버튼 */}
              <div className="pt-8 border-t border-gray-900">
                <div className="flex gap-4">
                  <button
                    onClick={handleContact}
                    className="flex-1 px-6 py-3 font-semibold text-white transition bg-black rounded-lg hover:bg-gray-800"
                  >
                    스카우트 제안
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-6 py-3 font-semibold text-gray-900 transition border border-gray-400 rounded-lg hover:bg-gray-50"
                  >
                    스크랩
                  </button>
                  <button
                    onClick={handleBackClick}
                    className="px-8 py-3 font-semibold text-white transition bg-black rounded-lg hover:bg-gray-800"
                  >
                    목록으로
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}