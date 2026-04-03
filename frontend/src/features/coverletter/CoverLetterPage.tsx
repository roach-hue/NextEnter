import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "../../stores/authStore";
import LeftSidebar from "../../components/LeftSidebar";
import CoverLetterFormPage from "./CoverLetterFormPage";
import CoverLetterDetailPage from "./CoverLetterDetailPage";
import { usePageNavigation } from "../../hooks/usePageNavigation";
import {
  getCoverLetterList,
  uploadCoverLetterFile,
  deleteCoverLetter,
  createCoverLetter,
  updateCoverLetter,
  type CoverLetter,
} from "../../api/coverletter";

// 데이터 타입 정의
interface CoverLetterItem {
  id: number;
  title: string;
  content: string;
  date: string;
  fileCount: number;
  status: string;
  files: string[];
}

interface CoverLetterPageProps {
  initialMenu?: string;
  onNavigate?: (page: string, subMenu?: string) => void;
}

// 현재 화면 상태를 나타내는 타입
type ViewMode = "list" | "create" | "detail" | "edit";

export default function CoverLetterPage({
  initialMenu,
  onNavigate,
}: CoverLetterPageProps) {
  const { user } = useAuthStore();

  /** ✅ 자소서 최대 개수 제한 */
  const MAX_COVER_LETTERS = 15;

  // 현재 화면 모드 (목록 / 작성 / 상세보기 / 수정)
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // 선택된 자소서 ID
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 자소서 목록
  const [coverLetterList, setCoverLetterList] = useState<CoverLetterItem[]>([]);

  // 로딩 상태
  const [loading, setLoading] = useState(false);

  // 선택된 항목들 (일괄 삭제용)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 호버된 항목
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { activeMenu, handleMenuClick } = usePageNavigation(
    "resume",
    initialMenu,
    onNavigate,
  );

  // ✅ 자소서 목록 불러오기
  const loadCoverLetters = useCallback(async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const response = await getCoverLetterList(user.userId, 0, 100);

      const items: CoverLetterItem[] = response.content.map(
        (cl: CoverLetter) => {
          const hasFile = !!cl.filePath;
          const hasContent = !!(cl.content && cl.content.trim().length > 0);

          return {
            id: cl.coverLetterId,
            title: cl.title,
            content: cl.content || "",
            date: new Date(cl.updatedAt).toLocaleDateString(),
            fileCount: hasFile ? 1 : 0,
            status: hasFile
              ? "불러온 파일"
              : hasContent
                ? "작성완료"
                : "작성중",
            files: hasFile ? [cl.title] : [],
          };
        },
      );

      setCoverLetterList(items);
    } catch (error) {
      console.error("자소서 목록 로드 실패:", error);
      alert("자소서 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    loadCoverLetters();
  }, [loadCoverLetters]);

  /** ✅ 현재 개수/제한 여부 */
  const isLimitReached = coverLetterList.length >= MAX_COVER_LETTERS;

  // 파일 업로드 버튼 클릭
  const handleFileUpload = () => {
    // ✅ 제한 걸리면 업로드 막기
    if (isLimitReached) {
      alert(`자소서는 최대 ${MAX_COVER_LETTERS}개까지만 등록할 수 있습니다.`);
      return;
    }
    fileInputRef.current?.click();
  };

  // ✅ 파일 선택 시 처리 - API 호출
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.userId) return;

    // ✅ 제한 걸리면 업로드 막기
    if (isLimitReached) {
      alert(`자소서는 최대 ${MAX_COVER_LETTERS}개까지만 등록할 수 있습니다.`);
      e.target.value = "";
      return;
    }

    // 파일 확장자 검증
    const ext = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["pdf", "doc", "docx", "txt", "hwp"];

    if (!validExtensions.includes(ext || "")) {
      alert("PDF, DOC, DOCX, TXT, HWP 파일만 업로드 가능합니다.");
      e.target.value = "";
      return;
    }

    try {
      setLoading(true);
      const response = await uploadCoverLetterFile(user.userId, file);

      await loadCoverLetters();

      alert(`"${response.title}" 파일이 성공적으로 업로드되었습니다.`);
    } catch (error: any) {
      console.error("파일 업로드 실패:", error);
      alert(error.response?.data?.message || "파일 업로드에 실패했습니다.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // ✅ 자소서 작성 완료 시 저장 - API 호출
  const handleSaveData = async (data: {
    title: string;
    content: string;
    fileCount: number;
    files: string[];
  }) => {
    if (!user?.userId) return;

    // ✅ 제한 걸리면 저장 막기
    if (isLimitReached) {
      alert(`자소서는 최대 ${MAX_COVER_LETTERS}개까지만 등록할 수 있습니다.`);
      setViewMode("list");
      return;
    }

    try {
      setLoading(true);
      await createCoverLetter(user.userId, {
        title: data.title || "제목 없는 자소서",
        content: data.content,
      });

      await loadCoverLetters();
      setViewMode("list");
      alert("자소서가 등록되었습니다.");
    } catch (error: any) {
      console.error("자소서 저장 실패:", error);
      alert(error.response?.data?.message || "자소서 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 자소서 카드 클릭 → 상세보기로 이동
  const handleCardClick = (id: number) => {
    setSelectedId(id);
    setViewMode("detail");
  };

  // 상세보기에서 수정 클릭
  const handleEditClick = () => {
    setViewMode("edit");
  };

  // ✅ 개별 삭제
  const handleDeleteClick = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.userId) return;

    if (!confirm("정말로 이 자소서를 삭제하시겠습니까?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteCoverLetter(user.userId, id);

      setCoverLetterList((prev) => prev.filter((item) => item.id !== id));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
      alert("자소서가 삭제되었습니다.");
    } catch (error: any) {
      console.error("자소서 삭제 실패:", error);
      alert(error.response?.data?.message || "자소서 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 일괄 삭제
  const handleBulkDelete = async () => {
    if (!user?.userId || selectedIds.length === 0) return;

    if (
      !confirm(`선택한 ${selectedIds.length}개의 자소서를 삭제하시겠습니까?`)
    ) {
      return;
    }

    try {
      setLoading(true);
      for (const id of selectedIds) {
        await deleteCoverLetter(user.userId, id);
      }

      setCoverLetterList((prev) =>
        prev.filter((item) => !selectedIds.includes(item.id)),
      );
      setSelectedIds([]);
      alert("선택한 자소서가 삭제되었습니다.");
    } catch (error: any) {
      console.error("일괄 삭제 실패:", error);
      alert(error.response?.data?.message || "삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 상세보기에서 삭제
  const handleDelete = async () => {
    if (!selectedId || !user?.userId) return;

    if (!confirm("정말로 이 자소서를 삭제하시겠습니까?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteCoverLetter(user.userId, selectedId);

      setCoverLetterList((prev) =>
        prev.filter((item) => item.id !== selectedId),
      );
      setSelectedId(null);
      setViewMode("list");
      alert("자소서가 삭제되었습니다.");
    } catch (error: any) {
      console.error("자소서 삭제 실패:", error);
      alert(error.response?.data?.message || "자소서 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 자소서 수정 완료 시 업데이트 - API 호출
  const handleUpdateData = async (data: {
    title: string;
    content: string;
    fileCount: number;
    files: string[];
  }) => {
    if (!selectedId || !user?.userId) return;

    try {
      setLoading(true);
      await updateCoverLetter(user.userId, selectedId, {
        title: data.title || "제목 없는 자소서",
        content: data.content,
      });

      await loadCoverLetters();
      setViewMode("detail");
      alert("자소서가 수정되었습니다.");
    } catch (error: any) {
      console.error("자소서 수정 실패:", error);
      alert(error.response?.data?.message || "자소서 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 체크박스 토글
  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  // ✅ 전체 선택
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = coverLetterList.map((item) => item.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  // 선택된 자소서 데이터 가져오기
  const selectedCoverLetter = coverLetterList.find(
    (item) => item.id === selectedId,
  );

  // 날짜 포맷팅 (현재 코드 유지)
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}. ${month}. ${day}`;
  };

  // 작성 모드
  if (viewMode === "create") {
    return (
      <CoverLetterFormPage
        onBack={() => {
          setViewMode("list");
          loadCoverLetters();
        }}
        onMenuClick={handleMenuClick}
        onSave={handleSaveData}
        activeMenu={activeMenu}
      />
    );
  }

  // 상세보기 모드
  if (viewMode === "detail" && selectedCoverLetter) {
    return (
      <CoverLetterDetailPage
        coverLetter={selectedCoverLetter}
        onBack={() => {
          setSelectedId(null);
          setViewMode("list");
          loadCoverLetters();
        }}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onMenuClick={handleMenuClick}
        activeMenu={activeMenu}
      />
    );
  }

  // 수정 모드
  if (viewMode === "edit" && selectedCoverLetter) {
    return (
      <CoverLetterFormPage
        onBack={() => setViewMode("detail")}
        onMenuClick={handleMenuClick}
        onSave={handleUpdateData}
        initialData={selectedCoverLetter}
        isEditMode={true}
        activeMenu={activeMenu}
      />
    );
  }

  // 목록 모드 (기본)
  return (
    <div className="px-4 py-8 mx-auto bg-white max-w-7xl">
      <div className="flex items-start gap-6">
        <LeftSidebar
          title="자소서"
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
        />

        <div className="flex-1 space-y-8">
          {/* 1. 파일 업로드 영역 */}
          <div className="px-6 py-5 border-2 border-blue-300 border-dashed rounded-2xl bg-blue-50">
            <div className="text-center">
              <div className="mb-2 text-3xl">📁</div>
              <h3 className="mb-1 text-base font-bold">
                파일을 드래그 하거나 클릭하여 업로드
              </h3>
              <p className="mb-2 text-xs text-gray-600">
                지원 형식: PDF, WORD, HWP, TXT (최대 10MB)
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.hwp,.txt"
                className="hidden"
              />
              <button
                onClick={handleFileUpload}
                disabled={loading || isLimitReached}
                className="px-5 py-1.5 text-xs font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLimitReached ? "작성한도 초과" : "파일선택"}
              </button>
            </div>
          </div>

          {/* 3. 리스트 컨테이너 */}
          <section className="bg-white border border-gray-300 rounded-xl flex flex-col overflow-hidden min-h-[400px] shadow-sm mt-8">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-bold text-blue-600">
                    내 자소서 관리{" "}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      총 {coverLetterList.length}건 / 최대 {MAX_COVER_LETTERS}개
                    </span>
                  </h3>

                  {selectedIds.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      disabled={loading}
                      className="px-3 py-1 text-sm font-medium text-gray-600 transition-all bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
                    >
                      선택 삭제 ({selectedIds.length})
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {coverLetterList.length > 0 && (
                    <label className="flex items-center gap-1.5 cursor-pointer select-none mr-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
                        checked={
                          coverLetterList.length > 0 &&
                          coverLetterList.every((item) =>
                            selectedIds.includes(item.id),
                          )
                        }
                        onChange={handleSelectAll}
                      />
                      <span className="text-sm font-medium text-gray-600 hover:text-gray-900">
                        전체 선택
                      </span>
                    </label>
                  )}

                  <button
                    onClick={() => {
                      if (isLimitReached) {
                        alert(
                          `자소서는 최대 ${MAX_COVER_LETTERS}개까지만 작성할 수 있습니다.`,
                        );
                        return;
                      }
                      setViewMode("create");
                    }}
                    disabled={loading || isLimitReached}
                    className={`px-4 py-1.5 text-xs font-bold text-white transition rounded hover:shadow-md ${
                      isLimitReached
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } disabled:opacity-50`}
                  >
                    {isLimitReached ? "작성한도 초과" : "+ 자소서 작성"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 divide-y divide-gray-100">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-gray-500">로딩 중...</div>
                </div>
              ) : coverLetterList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                  <div className="mb-4 text-4xl">📝</div>
                  <p className="mb-2">등록된 자소서가 없습니다.</p>
                  <button
                    onClick={() => {
                      if (isLimitReached) {
                        alert(
                          `자소서는 최대 ${MAX_COVER_LETTERS}개까지만 작성할 수 있습니다.`,
                        );
                        return;
                      }
                      setViewMode("create");
                    }}
                    disabled={loading || isLimitReached}
                    className="px-6 py-2 text-sm font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                  >
                    첫 자소서 작성하기
                  </button>
                </div>
              ) : (
                coverLetterList.map((item) => {
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleCardClick(item.id)}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`group flex items-center px-5 py-4 cursor-pointer transition-all duration-200 ${
                        hoveredId === item.id
                          ? "bg-blue-50/50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {/* 체크박스 */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center pr-5"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
                          checked={selectedIds.includes(item.id)}
                          onChange={(e) => toggleSelect(item.id, e as any)}
                        />
                      </div>

                      {/* 상태 배지 */}
                      <div className="flex-shrink-0 w-24">
                        <span
                          className={`inline-flex items-center justify-center w-full px-2.5 py-1 text-xs font-medium rounded-md border whitespace-nowrap ${
                            item.status === "불러온 파일"
                              ? "text-purple-700 bg-purple-50 border-purple-200"
                              : item.status === "작성완료"
                                ? "text-green-700 bg-green-50 border-green-200"
                                : "text-orange-700 bg-orange-50 border-orange-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* 제목 및 정보 */}
                      <div className="flex-1 min-w-0 ml-6">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-blue-700">
                            {item.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>최종수정: {formatDate(item.date)}</span>
                          <span className="w-0.5 h-0.5 bg-gray-400 rounded-full"></span>
                          <span>첨부파일: {item.fileCount}개</span>
                        </div>
                      </div>

                      {/* 삭제 버튼 */}
                      <div className="flex items-center gap-4 ml-4">
                        <button
                          onClick={(e) => handleDeleteClick(item.id, e)}
                          disabled={loading}
                          className="p-2 text-red-600 transition-all rounded-full hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
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
