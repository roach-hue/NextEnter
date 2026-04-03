import React, { useState } from "react";

interface Resume {
  id: number;
  title: string;
  industry: string;
  applications: number;
}

interface InterviewSetupProps {
  resumes: Resume[];
  selectedResumeId: number | null;
  onResumeChange: (id: number) => void;
  onStart: (portfolioText: string, portfolioFiles: File[]) => void;
  isLoading: boolean;
}

export default function InterviewSetup({
  resumes,
  selectedResumeId,
  onResumeChange,
  onStart,
  isLoading,
}: InterviewSetupProps) {
  const [portfolioText, setPortfolioText] = useState("");
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // 파일 업로드 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    processFiles(newFiles);
  };

  const processFiles = (files: File[]) => {
    // PDF/DOCX 파일 필터링
    const validFiles = files.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const validExtensions = ["pdf", "docx"];
      const validMimeTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      return (
        validExtensions.includes(ext || "") &&
        validMimeTypes.includes(file.type)
      );
    });

    if (validFiles.length !== files.length) {
      const invalidFiles = files.filter((f) => !validFiles.includes(f));
      alert(
        `다음 파일은 업로드할 수 없습니다:\n${invalidFiles.map((f) => f.name).join("\n")}\n\nPDF, DOCX 파일만 업로드 가능합니다.`
      );
    }

    if (validFiles.length > 0) {
      setPortfolioFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      processFiles(newFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    setPortfolioFiles((prev) => prev.filter((_, i) => i !== index));
  };


  return (
    <div className="bg-white border-2 border-blue-400 rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 text-gray-800">모의면접 설정</h2>
        <p className="text-gray-500">
          면접을 시작하기 전 AI에게 전달할 정보를 확인해주세요.
        </p>
      </div>

      <div className="space-y-8">
        {/* 1. 타겟 이력서 선택 */}
        <section>
          <label className="block text-lg font-bold mb-3 text-gray-700">
            🎯 타겟 이력서
            <span className="text-sm font-normal text-blue-500 ml-2">
              (필수)
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedResumeId || ""}
              onChange={(e) => {
                const newResumeId = Number(e.target.value);
                console.log("📋 이력서 선택 변경:", {
                  이전: selectedResumeId,
                  새로운: newResumeId,
                  선택된이력서: resumes.find(r => r.id === newResumeId)
                });
                onResumeChange(newResumeId);
              }}
              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            >
              <option value="" disabled>
                이력서를 선택해주세요
              </option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.title} ({resume.industry})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            * 선택한 이력서의 내용을 바탕으로 맞춤형 질문이 생성됩니다.
          </p>
        </section>

        {/* 2. 포트폴리오 및 프로젝트 정보 */}
        <section>
          <label className="block text-lg font-bold mb-3 text-gray-700 flex items-center justify-between">
            <div>
              📂 포트폴리오 / 프로젝트
              <span className="text-sm font-normal text-gray-400 ml-2">
                (선택)
              </span>
            </div>
          </label>
          <div className="space-y-3">
            <textarea
              value={portfolioText}
              onChange={(e) => setPortfolioText(e.target.value)}
              placeholder="프로젝트 경험이나 깃허브 링크, 포트폴리오 요약을 간단히 입력해주세요. AI 면접관이 이를 참고하여 심층 질문을 합니다."
              className="w-full p-4 border border-gray-300 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* 파일 첨부 영역 (Drag & Drop) */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.docx"
                className="hidden"
                id="portfolio-file-upload"
                onChange={handleFileChange}
              />
              <label
                htmlFor="portfolio-file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <span className="text-4xl">📎</span>
                <span className="text-gray-600 font-medium">
                  {isDragOver ? "여기에 파일을 놓으세요" : "포트폴리오 파일 추가"}
                </span>
                <span className="text-xs text-gray-400">
                  클릭하거나 파일을 드래그하세요 (PDF, DOCX)
                </span>
              </label>
            </div>

            {/* 업로드된 파일 목록 */}
            {portfolioFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  첨부된 파일 ({portfolioFiles.length}개)
                </p>
                {portfolioFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm bg-blue-50 px-3 py-2 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-2">
                      <span>📄</span>
                      <span className="truncate max-w-[300px] text-gray-700">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-red-500 hover:text-red-700 font-bold text-lg px-2"
                      title="파일 제거"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-400">
              💡 포트폴리오 파일은 면접 시작 시 AI에게 전달됩니다. (백엔드 API 연동 예정)
            </p>
          </div>
        </section>

        <button
          onClick={() => {
            onStart(portfolioText, portfolioFiles);
          }}
          disabled={!selectedResumeId || isLoading}
          className={`w-full py-4 text-xl font-bold rounded-xl transition shadow-md ${
            !selectedResumeId || isLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02]"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="animate-spin text-2xl">⏳</span>
              면접 준비 중...
            </div>
          ) : (
            "면접 시작하기 ✨"
          )}
        </button>
      </div>
    </div>
  );
}
