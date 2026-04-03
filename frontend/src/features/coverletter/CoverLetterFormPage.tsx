import { useState, useRef, useEffect } from "react";
import LeftSidebar from "../../components/LeftSidebar"; // [수정] LeftSidebar 사용

// 초기 데이터 타입 (수정 모드에서 사용)
interface InitialData {
  id: number;
  title: string;
  content: string;
  files: string[];
}

interface CoverLetterFormPageProps {
  onBack: () => void; // 부모(Page)에게 "나 끝났어!" 하고 알리는 신호기
  onMenuClick: (menuId: string) => void;
  onSave: (data: {
    title: string;
    content: string;
    fileCount: number;
    files: string[];
  }) => void;
  initialData?: InitialData; // 수정 모드일 때 기존 데이터
  isEditMode?: boolean; // 수정 모드 여부
  activeMenu?: string; // 현재 활성 메뉴 (부모에서 전달)
}

export default function CoverLetterFormPage({
  onBack,
  onMenuClick,
  onSave,
  initialData,
  isEditMode = false,
  activeMenu = "resume-sub-2", // 기본값 설정
}: CoverLetterFormPageProps) {
  // 2. 입력값 관리 (제목, 내용) - 수정 모드일 경우 초기값 설정
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");

  // 3. 파일 업로드 관리 - 수정 모드일 경우 기존 파일 목록 설정
  const [coverLetterFiles, setCoverLetterFiles] = useState<string[]>(
    initialData?.files || [],
  );
  const coverLetterFileInputRef = useRef<HTMLInputElement>(null);

  // 수정 모드에서 initialData가 변경되면 상태 업데이트
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setCoverLetterFiles(initialData.files || []);
    }
  }, [initialData]);

  const handleCoverLetterFileUpload = () => {
    coverLetterFileInputRef.current?.click();
  };

  const handleCoverLetterFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverLetterFiles([...coverLetterFiles, file.name]);
    }
  };

  const removeCoverLetterFile = (index: number) => {
    setCoverLetterFiles(coverLetterFiles.filter((_, i) => i !== index));
  };

  // 4. 저장/취소 버튼
  const handleSubmit = () => {
    onSave({
      title: title,
      content: content,
      fileCount: coverLetterFiles.length,
      files: coverLetterFiles,
    });

    alert(isEditMode ? "자소서가 수정되었습니다." : "자소서가 등록되었습니다.");
  };

  const handleCancel = () => {
    const message = isEditMode
      ? "수정을 취소하시겠습니까?"
      : "작성을 취소하시겠습니까?";
    if (window.confirm(message)) {
      onBack(); // 이전 화면으로 돌아가기
    }
  };

  const handleSidebarClick = (menuId: string) => {
    if (
      window.confirm(
        "페이지를 이동하면 작성 중인 내용이 사라집니다. 이동하시겠습니까?",
      )
    ) {
      onMenuClick(menuId); // 확인 누르면 부모에게 이동 요청
    }
  };

  return (
    <div className="px-4 py-8 mx-auto bg-white max-w-7xl">
      {/* ✅ [수정] 레이아웃 변경: items-start */}
      <div className="flex items-start gap-6">
        {/* ✅ [수정] LeftSidebar + Title 적용 */}
        <LeftSidebar
          title={isEditMode ? "자소서 수정" : "자소서 작성"}
          activeMenu={activeMenu}
          onMenuClick={handleSidebarClick}
        />

        {/* 메인 컨텐츠 */}
        <div className="flex-1 space-y-8">
          <section className="p-8 bg-white border-2 border-gray-200 rounded-2xl">
            <div className="mb-8">
              {/* 제목 입련란 */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">제목</h3>
                <button
                  onClick={handleCoverLetterFileUpload}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + 파일 첨부
                </button>
              </div>
              <input
                type="file"
                ref={coverLetterFileInputRef}
                onChange={handleCoverLetterFileChange}
                className="hidden"
              />
              {coverLetterFiles.length > 0 && (
                <div className="mb-6 space-y-2">
                  {coverLetterFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <button
                        onClick={() => removeCoverLetterFile(index)}
                        className="px-3 py-1 text-sm border rounded-full hover:bg-gray-100"
                      >
                        X | {file}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 입력 폼 */}
              <div className="space-y-4">
                <div className="p-4 border-2 border-gray-300 rounded-lg">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="자소서 제목을 작성해주세요."
                    className="w-full font-medium outline-none"
                  />
                </div>
                <h3 className="text-lg font-bold">내용</h3>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요."
                  rows={15}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg outline-none resize-none"
                />
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                onClick={handleCancel}
                className="px-8 py-3 font-semibold text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700"
              >
                {isEditMode ? "수정" : "등록"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
