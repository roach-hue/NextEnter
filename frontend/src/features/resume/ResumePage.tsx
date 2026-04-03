import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useResumeStore } from "../../stores/resumeStore";
import { getResumeList, deleteResume } from "../../api/resume";
import { JOB_CATEGORIES } from "../../constants/jobConstants";
import LeftSidebar from "../../components/LeftSidebar";
import ResumeFormPage from "./ResumeFormPage";
import { usePageNavigation } from "../../hooks/usePageNavigation";

export interface ResumeListItem {
  resumeId: number;
  title: string;
  jobCategory?: string;
  isMain: boolean;
  visibility: string;
  viewCount: number;
  status?: string;
  isIncomplete?: boolean;
  createdAt: string;
}

export default function ResumePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setResumes: setContextResumes } = useResumeStore();

  const { activeMenu, handleMenuClick } = usePageNavigation(
    "resume",
    "resume-sub-1",
  );

  const [isCreating, setIsCreating] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [openVisibilityDropdownId, setOpenVisibilityDropdownId] = useState<
    number | null
  >(null);

  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  /** 파일 업로드 시 선택한 직무 (기본: 백엔드) */
  const [uploadJobCategory, setUploadJobCategory] = useState<string>(JOB_CATEGORIES[1]);
  const [isDragging, setIsDragging] = useState(false);

  const loadResumes = useCallback(async () => {
    if (!user?.userId) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await getResumeList(user.userId);
      if (Array.isArray(data)) {
        const typedData = data as unknown as ResumeListItem[];
        setResumes(typedData);
        setContextResumes(typedData as any);
      } else {
        setError("잘못된 응답 형식입니다.");
      }
    } catch (err: any) {
      console.error("이력서 목록 로드 오류:", err);
      setError("이력서 목록 불러오기에 실패하였습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId, setContextResumes]);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-visibility-dropdown='true']")) return;
      setOpenVisibilityDropdownId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCreateResume = () => {
    if (resumes.length >= 5) {
      alert("이력서는 최대 5개까지만 작성할 수 있습니다.");
      return;
    }
    setSelectedResumeId(null);
    setIsCreating(true);
  };

  const handleBackToList = () => {
    setIsCreating(false);
    setSelectedResumeId(null);
    loadResumes();
  };

  const handleDeleteClick = async (resumeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.userId) return;
    if (window.confirm("정말 이 이력서를 삭제하시겠습니까?")) {
      try {
        await deleteResume(resumeId, user.userId);
        alert("삭제되었습니다.");
        loadResumes();
        setSelectedIds((prev) => prev.filter((id) => id !== resumeId));
      } catch (err) {
        console.error("삭제 실패:", err);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!user?.userId || selectedIds.length === 0) return;
    if (
      window.confirm(
        `선택한 ${selectedIds.length}개의 이력서를 삭제하시겠습니까?`,
      )
    ) {
      try {
        for (const id of selectedIds) {
          await deleteResume(id, user.userId);
        }
        alert("선택한 이력서가 삭제되었습니다.");
        setSelectedIds([]);
        loadResumes();
      } catch (err) {
        console.error("일괄 삭제 실패:", err);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const toggleSelect = (resumeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(resumeId)
        ? prev.filter((id) => id !== resumeId)
        : [...prev, resumeId],
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = resumes.map((r) => r.resumeId);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleChangeVisibility = async (
    resumeId: number,
    visibility: "PUBLIC" | "PRIVATE",
  ) => {
    setResumes((prev) =>
      prev.map((r) => (r.resumeId === resumeId ? { ...r, visibility } : r)),
    );
    setOpenVisibilityDropdownId(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}. ${month}. ${day}`;
  };

  const handleFileUpload = () => fileInputRef.current?.click();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(fakeEvent);
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.userId) return;

    // 파일 확장자 및 MIME 타입 검증
    const ext = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["pdf", "docx"];
    const validMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!validExtensions.includes(ext || "") || !validMimeTypes.includes(file.type)) {
      alert("PDF, DOCX 파일만 업로드 가능합니다.");
      return;
    }

    console.log("파일 업로드됨:", file.name);
    setIsLoading(true);

    try {
      // 파일 이름에서 확장자 제거하여 이력서 제목으로 사용
      const resumeTitle = file.name.replace(/\.(pdf|docx)$/i, "");
      
      const resumeData = {
        title: resumeTitle,
        jobCategory: uploadJobCategory,
        status: "COMPLETED",
      };

      // createResumeWithFiles API 호출
      const { createResumeWithFiles } = await import("../../api/resume");
      const response = await createResumeWithFiles(
        resumeData,
        user.userId,
        [file], // resumeFiles
        [],     // portfolioFiles
        []      // coverLetterFiles
      );

      console.log("✅ 이력서 생성 완료:", response.resumeId);
      
      // 이력서 목록 새로고침
      await loadResumes();
      
      alert(`"${resumeTitle}" 이력서가 성공적으로 업로드되었습니다!`);
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (isCreating) {
    return (
      <ResumeFormPage
        onBack={handleBackToList}
        // @ts-ignore
        resumeId={selectedResumeId}
        initialMenu={activeMenu}
      />
    );
  }

  return (
    <div className="px-4 py-8 mx-auto bg-white max-w-7xl">
      {/* ✅ 1. 부모 Flex 컨테이너: items-start (Sticky 필수 조건) */}
      <div className="flex items-start gap-6">
        {/* ✅ 2. 왼쪽 사이드바 (자동 Sticky & 제목 적용) */}
        {/* 기존의 sticky wrapper div와 h2를 제거하고 LeftSidebar에 title을 넘깁니다. */}
        <LeftSidebar
          title="이력서"
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
        />

        {/* ✅ 3. 메인 컨텐츠 */}
        <div className="flex-1 space-y-8">
          {/* 1. 파일 업로드 영역 */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileUpload}
            className={`px-6 py-5 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-100"
                : "border-blue-300 bg-blue-50 hover:bg-blue-100/50"
            }`}>
            <div className="text-center">
              <div className="mb-2 text-3xl">📁</div>
              <h3 className="mb-1 text-base font-bold">
                파일을 드래그 하거나 클릭하여 업로드
              </h3>
              <p className="mb-2 text-xs text-gray-600">
                지원 형식: PDF, WORD, HWP, EXCEL (최대 10MB)
              </p>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.hwp,.xls,.xlsx"
                className="hidden"
              />
              <button
                className="px-5 py-1.5 text-xs font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                파일선택
              </button>
            </div>
          </div>

          {/* 2. 안내문 영역 */}
          <div className="p-5 mt-2 border border-gray-300 bg-gray-50 rounded-xl">
            <h4 className="mb-4 text-sm font-bold text-gray-800">
              업로드 후 자동으로 전환됩니다
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                  1
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    텍스트 추출
                  </div>
                  <div className="text-xs text-gray-500">
                    파일 텍스트 자동 추출
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                  2
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    AI 구조화
                  </div>
                  <div className="text-xs text-gray-500">
                    항목별 내용 자동 분류
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-bold text-white bg-blue-500 rounded-full">
                  3
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    점수 추정
                  </div>
                  <div className="text-xs text-gray-500">
                    논문 기반 등급 측정
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 리스트 컨테이너 */}
          <section className="bg-white border border-gray-300 rounded-xl flex flex-col overflow-hidden min-h-[400px] shadow-sm mt-8">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-bold text-blue-600">
                    내 이력서 관리{" "}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      총 {resumes.length}건 / 최대 5개
                    </span>
                  </h3>
                  {selectedIds.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 text-sm font-medium text-gray-600 transition-all bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      선택 삭제 ({selectedIds.length})
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {resumes.length > 0 && (
                    <label className="flex items-center gap-1.5 cursor-pointer select-none mr-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
                        checked={
                          resumes.length > 0 &&
                          resumes.every((r) => selectedIds.includes(r.resumeId))
                        }
                        onChange={handleSelectAll}
                      />
                      <span className="text-sm font-medium text-gray-600 hover:text-gray-900">
                        전체 선택
                      </span>
                    </label>
                  )}

                  <button
                    onClick={handleCreateResume}
                    className={`px-4 py-1.5 text-xs font-bold text-white transition rounded hover:shadow-md ${
                      resumes.length >= 5
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {resumes.length >= 5 ? "작성한도 초과" : "+ 이력서 작성"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 divide-y divide-gray-100">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-gray-500">로딩 중...</div>
                </div>
              ) : resumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                  <div className="mb-4 text-4xl">📄</div>
                  <p className="mb-2">등록된 이력서가 없습니다.</p>
                  <button
                    onClick={handleCreateResume}
                    className="px-6 py-2 text-sm font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    첫 이력서 작성하기
                  </button>
                </div>
              ) : (
                resumes.map((resume) => {
                  const isOpen = openVisibilityDropdownId === resume.resumeId;
                  const isPublic = resume.visibility === "PUBLIC";

                  return (
                    <div
                      key={resume.resumeId}
                      onClick={() =>
                        navigate(`/user/resume/${resume.resumeId}`)
                      }
                      onMouseEnter={() => setHoveredId(resume.resumeId)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`group flex items-center px-5 py-4 cursor-pointer transition-all duration-200 ${
                        hoveredId === resume.resumeId
                          ? "bg-blue-50/50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center pr-5"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
                          checked={selectedIds.includes(resume.resumeId)}
                          onChange={(e) =>
                            toggleSelect(resume.resumeId, e as any)
                          }
                        />
                      </div>

                      <div className="flex-shrink-0 w-24">
                        <span
                          className={`inline-flex items-center justify-center w-full px-2.5 py-1 text-xs font-medium rounded-md border whitespace-nowrap ${
                            isPublic
                              ? "text-green-700 bg-green-50 border-green-200"
                              : "text-gray-700 bg-gray-100 border-gray-200"
                          }`}
                        >
                          {isPublic ? "공개" : "비공개"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 ml-6">
                        <div className="flex items-center gap-2 mb-0.5">
                          {resume.isIncomplete && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold text-orange-700 bg-orange-100 rounded border border-orange-200 whitespace-nowrap">
                              작성중
                            </span>
                          )}
                          <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-blue-700">
                            {resume.title}
                          </h3>
                          {resume.isMain && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 rounded border border-blue-100 whitespace-nowrap">
                              대표
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{resume.jobCategory || "직무 미정"}</span>
                          <span className="w-0.5 h-0.5 bg-gray-400 rounded-full"></span>
                          <span>{formatDate(resume.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 ml-4">
                        <div
                          className="relative"
                          data-visibility-dropdown="true"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenVisibilityDropdownId((prev) =>
                                prev === resume.resumeId
                                  ? null
                                  : resume.resumeId,
                              )
                            }
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 transition bg-white border border-gray-300 rounded hover:bg-gray-50"
                          >
                            <span>설정</span>
                            <span className="text-[10px]">▾</span>
                          </button>

                          {isOpen && (
                            <div className="absolute right-0 z-10 w-24 mt-1 overflow-hidden bg-white border border-gray-200 rounded shadow-lg">
                              <button
                                onClick={() =>
                                  handleChangeVisibility(
                                    resume.resumeId,
                                    "PUBLIC",
                                  )
                                }
                                className="w-full px-3 py-2 text-xs font-medium text-left text-green-700 hover:bg-gray-50"
                              >
                                공개
                              </button>
                              <button
                                onClick={() =>
                                  handleChangeVisibility(
                                    resume.resumeId,
                                    "PRIVATE",
                                  )
                                }
                                className="w-full px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-50"
                              >
                                비공개
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleDeleteClick(resume.resumeId, e)}
                          className="p-2 text-red-600 transition-all rounded-full hover:bg-red-50 hover:text-red-700"
                          title="삭제"
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
                              strokeWidth={1.5}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
